from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Diagnosis
from .serializers import DiagnosisSerializer, DiagnosisCreateSerializer
from .ml.model import classifier
from apps.crops.models import Crop, StatusLog

class DiagnosisViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Diagnóstico Fitosanitario con Deep Learning.
    Soporta carga de imágenes, inferencia automática y listado por cultivo.
    """
    serializer_class = DiagnosisSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['diagnosed_at', 'confidence']

    def get_queryset(self):
        qs = Diagnosis.objects.filter(user=self.request.user).select_related('crop', 'crop__plot')
        crop_id = self.request.query_params.get('crop')
        if crop_id:
            qs = qs.filter(crop_id=crop_id)
        is_healthy = self.request.query_params.get('is_healthy')
        if is_healthy is not None:
            qs = qs.filter(is_healthy=is_healthy.lower() == 'true')
        return qs

    def create(self, request, *args, **kwargs):
        serializer = DiagnosisCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        crop = serializer.validated_data.get('crop')
        image_file = serializer.validated_data.get('image')

        # Create basic instance first to save image to media path
        diagnosis = Diagnosis.objects.create(
            user=request.user,
            crop=crop,
            image=image_file,
            disease_common_name="Analizando...",
            confidence=0.0
        )

        # Get species hint from crop if available
        species_hint = crop.species if crop else None

        # Execute Deep Learning Inference
        try:
            prediction = classifier.predict(diagnosis.image.path, crop_species_hint=species_hint)
            
            diagnosis.disease_common_name = prediction["disease_common_name"]
            diagnosis.disease_scientific_name = prediction["disease_scientific_name"]
            diagnosis.confidence = prediction["confidence"]
            diagnosis.severity = prediction["severity"]
            diagnosis.is_healthy = prediction["is_healthy"]
            diagnosis.symptoms = prediction["symptoms"]
            diagnosis.treatment_plan = prediction["treatment_plan"]
            diagnosis.top_predictions = prediction["top_predictions"]
            diagnosis.save()

            # If associated with crop, update crop status and create a status log
            if crop:
                if not diagnosis.is_healthy:
                    crop.status = 'alert'
                    crop.save(update_fields=['status'])
                    
                    StatusLog.objects.create(
                        crop=crop,
                        status='warning' if diagnosis.severity in ['Media', 'Moderada'] else 'critical',
                        title=f"Diagnóstico IA: {diagnosis.disease_common_name}",
                        observations=f"Detectado con {diagnosis.confidence}% de certeza. {diagnosis.symptoms}",
                        photo=diagnosis.image,
                        logged_at=timezone.now()
                    )
                else:
                    if crop.status == 'alert':
                        crop.status = 'healthy'
                        crop.save(update_fields=['status'])

        except Exception as e:
            diagnosis.disease_common_name = "Error en Inferencia"
            diagnosis.symptoms = str(e)
            diagnosis.save()

        output_serializer = DiagnosisSerializer(diagnosis, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        """Permite al agricultor confirmar o corregir el diagnóstico de la IA."""
        diagnosis = self.get_object()
        feedback = request.data.get('feedback', 'confirmed')
        if feedback in ['confirmed', 'doubtful', 'rejected']:
            diagnosis.user_feedback = feedback
            diagnosis.save(update_fields=['user_feedback'])
            return Response({'status': 'Feedback registrado', 'feedback': feedback})
        return Response({'error': 'Opción inválida'}, status=status.HTTP_400_BAD_REQUEST)
