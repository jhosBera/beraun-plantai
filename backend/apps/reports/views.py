from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Alert, Notification
from .serializers import AlertSerializer, NotificationSerializer
from .pdf_generator import generate_crop_health_pdf
from apps.crops.models import Crop

class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Alertas y Recordatorios de Cuidado (RF-14).
    """
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['scheduled_for', 'created_at']

    def get_queryset(self):
        qs = Alert.objects.filter(user=self.request.user).select_related('crop')
        crop_id = self.request.query_params.get('crop')
        if crop_id:
            qs = qs.filter(crop_id=crop_id)
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para Notificaciones in-app del usuario (RF-14).
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['post'], url_path='read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'Notificación marcada como leída'})

    @action(detail=False, methods=['post'], url_path='read-all')
    def mark_all_read(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': f'{updated} notificaciones marcadas como leídas'})


class ExportCropPDFView(APIView):
    """
    RF-13: Descarga del Historial de Salud del Cultivo en formato PDF.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, crop_id):
        crop = get_object_or_404(Crop, id=crop_id, plot__user=request.user)
        pdf_bytes = generate_crop_health_pdf(crop)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f"reporte_salud_{crop.species}_{crop.name}_{crop.id}.pdf".replace(' ', '_')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
