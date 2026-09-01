from django.db import models
from django.conf import settings
from apps.crops.models import Crop

class Alert(models.Model):
    """Módulo 5: RF-14 Alertas y Recordatorios de Cuidado (riego, abono, revisión)."""
    ALERT_TYPES = (
        ('watering', 'Recordatorio de Riego'),
        ('fertilization', 'Aplicación de Fertilizante'),
        ('disease_check', 'Revisión de Síntomas / Fitosanitaria'),
        ('pruning', 'Poda'),
        ('fumigation', 'Fumigación de Control'),
        ('custom', 'Alerta Personalizada'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='Usuario'
    )
    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='Cultivo Destino'
    )
    alert_type = models.CharField('Tipo de Alerta', max_length=20, choices=ALERT_TYPES, default='watering')
    title = models.CharField('Título de la Alerta', max_length=150)
    description = models.TextField('Descripción / Instrucciones', blank=True)
    scheduled_for = models.DateTimeField('Fecha y Hora Programada')
    recurrence_days = models.PositiveIntegerField('Repetir cada (días)', default=0, help_text='0 para alerta única')
    is_active = models.BooleanField('Activa', default=True)
    is_sent = models.BooleanField('Disparada', default=False)
    last_triggered_at = models.DateTimeField('Última Notificación', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Alerta de Cuidado'
        verbose_name_plural = 'Alertas de Cuidado'
        ordering = ['scheduled_for']

    def __str__(self):
        return f"[{self.get_alert_type_display()}] {self.title} - {self.crop.name}"


class Notification(models.Model):
    """Módulo 5: Notificación in-app entregada al usuario."""
    TYPE_CHOICES = (
        ('reminder', 'Recordatorio'),
        ('warning', 'Alerta Fitosanitaria'),
        ('info', 'Información'),
        ('success', 'Éxito'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Destinatario'
    )
    alert = models.ForeignKey(
        Alert,
        on_delete=models.SET_NULL,
        related_name='notifications',
        null=True,
        blank=True,
        verbose_name='Alerta Origen'
    )
    title = models.CharField('Título', max_length=150)
    message = models.TextField('Mensaje')
    notification_type = models.CharField('Tipo', max_length=20, choices=TYPE_CHOICES, default='reminder')
    is_read = models.BooleanField('Leída', default=False)
    link_url = models.CharField('Enlace de Destino', max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({'Leída' if self.is_read else 'No leída'})"
