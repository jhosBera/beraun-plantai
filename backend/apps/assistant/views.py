from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer, SendMessageSerializer
from .services import deepseek_service
from .prompts import generate_treatment_prompt
from apps.diagnosis.models import Diagnosis

class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para interactuar con el Asistente Botánico DeepSeek (RF-10, RF-11, RF-12).
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).prefetch_related('messages').select_related('crop', 'diagnosis')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='messages')
    def send_message(self, request, pk=None):
        """RF-10: Envía un mensaje al chatbot y obtiene la respuesta de DeepSeek."""
        session = self.get_object()
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_content = serializer.validated_data['content']

        # 1. Guardar mensaje del usuario
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_content
        )

        # 2. Construir historial de la sesión
        history = list(session.messages.values('role', 'content'))

        # 3. Construir contexto adicional si hay diagnóstico vinculado
        extra_context = ""
        if session.diagnosis:
            diag = session.diagnosis
            extra_context = (
                f"Diagnóstico activo: {diag.disease_common_name} ({diag.disease_scientific_name}), "
                f"Certeza: {diag.confidence}%, Severidad: {diag.severity}, Síntomas: {diag.symptoms}"
            )
        elif session.crop:
            extra_context = f"Cultivo en consulta: {session.crop.species} - {session.crop.name}, Variedad: {session.crop.variety}"

        # 4. Obtener respuesta IA
        ai_reply = deepseek_service.generate_response(history, extra_system_context=extra_context)

        # 5. Guardar respuesta del asistente
        bot_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=ai_reply
        )

        return Response({
            'user_message': ChatMessageSerializer(user_msg).data,
            'assistant_message': ChatMessageSerializer(bot_msg).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='treatment-from-diagnosis')
    def treatment_from_diagnosis(self, request):
        """RF-11 y RF-12: Genera automáticamente plan de tratamiento y ajuste de calendario a partir de un diagnóstico."""
        diagnosis_id = request.data.get('diagnosis_id')
        if not diagnosis_id:
            return Response({'error': 'diagnosis_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            diagnosis = Diagnosis.objects.get(id=diagnosis_id, user=request.user)
        except Diagnosis.DoesNotExist:
            return Response({'error': 'Diagnóstico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        crop_name = diagnosis.crop.name if diagnosis.crop else "Cultivo analizado"
        species = diagnosis.crop.species if diagnosis.crop else "Planta"

        prompt_content = generate_treatment_prompt(
            crop_name=crop_name,
            species=species,
            disease_name=diagnosis.disease_common_name,
            scientific_name=diagnosis.disease_scientific_name,
            confidence=diagnosis.confidence,
            symptoms=diagnosis.symptoms
        )

        # Crear sesión de chat dedicada
        session = ChatSession.objects.create(
            user=request.user,
            crop=diagnosis.crop,
            diagnosis=diagnosis,
            title=f"Tratamiento: {diagnosis.disease_common_name}"
        )

        ChatMessage.objects.create(
            session=session,
            role='user',
            content=f"Por favor genera el plan de acción y ajuste de calendario para {diagnosis.disease_common_name} en {crop_name}."
        )

        # Invocación DeepSeek
        ai_treatment = deepseek_service.generate_response(
            [{"role": "user", "content": prompt_content}],
            extra_system_context=f"Diagnóstico ID {diagnosis.id}"
        )

        bot_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=ai_treatment
        )

        # Actualizar plan de tratamiento en el diagnóstico
        diagnosis.treatment_plan = ai_treatment
        diagnosis.save(update_fields=['treatment_plan'])

        return Response({
            'session_id': session.id,
            'treatment_plan': ai_treatment,
            'message': ChatMessageSerializer(bot_msg).data
        }, status=status.HTTP_201_CREATED)
