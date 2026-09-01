from django.db import models
from django.conf import settings
from apps.crops.models import Crop

class Diagnosis(models.Model):
    """Módulo 3: RF-06, RF-07, RF-08, RF-09 Diagnóstico Fitosanitario con Deep Learning."""
    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='diagnoses',
        verbose_name='Cultivo Afectado',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diagnoses',
        verbose_name='Usuario'
    )
    image = models.ImageField('Foto de la Hoja / Síntoma', upload_to='diagnoses/%Y/%m/')
    disease_common_name = models.CharField('Nombre Común de la Enfermedad', max_length=200)
    disease_scientific_name = models.CharField('Nombre Científico / Patógeno', max_length=200, blank=True)
    confidence = models.FloatField('Nivel de Certeza (%)', help_text='Porcentaje de certeza de la IA (0-100)')
    severity = models.CharField('Severidad Estimada', max_length=50, default='Moderada')
    is_healthy = models.BooleanField('Planta Saludable', default=False)
    symptoms = models.TextField('Síntomas Identificados', blank=True)
    treatment_plan = models.TextField('Plan de Acción Recomendado', blank=True)
    top_predictions = models.JSONField('Top 3 Predicciones', default=list, blank=True)
    user_feedback = models.CharField(
        'Confirmación del Agricultor',
        max_length=20,
        choices=(
            ('confirmed', 'Confirmado por usuario'),
            ('doubtful', 'Dudoso'),
            ('rejected', 'Rechazado'),
            ('pending', 'Pendiente'),
        ),
        default='pending'
    )
    diagnosed_at = models.DateTimeField('Fecha de Diagnóstico', auto_now_add=True)

    class Meta:
        verbose_name = 'Diagnóstico Fitosanitario'
        verbose_name_plural = 'Historial de Diagnósticos'
        ordering = ['-diagnosed_at']

    def __str__(self):
        return f"{self.disease_common_name} ({self.confidence}%) - {self.diagnosed_at.strftime('%Y-%m-%d %H:%M')}"
