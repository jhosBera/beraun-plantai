from django.db import models
from django.conf import settings

class Plot(models.Model):
    """Módulo 2: Parcela o sector geográfico dentro de la finca."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='plots',
        verbose_name='Propietario'
    )
    name = models.CharField('Nombre de la Parcela', max_length=150)
    location = models.CharField('Ubicación / Sector', max_length=255, blank=True)
    latitude = models.DecimalField('Latitud', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitud', max_digits=9, decimal_places=6, null=True, blank=True)
    area_hectares = models.DecimalField('Área (Hectáreas)', max_digits=6, decimal_places=2, default=1.0)
    soil_type = models.CharField('Tipo de Suelo', max_length=100, blank=True)
    notes = models.TextField('Notas u Observaciones', blank=True)
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)

    class Meta:
        verbose_name = 'Parcela'
        verbose_name_plural = 'Parcelas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.location or 'Sin ubicación'})"


class Crop(models.Model):
    """Módulo 2: RF-03 Registro de Cultivo o Planta."""
    STATUS_CHOICES = (
        ('growing', 'En Crecimiento'),
        ('healthy', 'Saludable'),
        ('alert', 'En Riesgo / Enfermo'),
        ('harvesting', 'En Cosecha'),
        ('harvested', 'Cosechado'),
        ('archived', 'Archivado'),
    )

    plot = models.ForeignKey(
        Plot,
        on_delete=models.CASCADE,
        related_name='crops',
        verbose_name='Parcela'
    )
    name = models.CharField('Nombre / Identificador', max_length=150, help_text='Ej: Lote Tomates 1')
    species = models.CharField('Especie', max_length=100, help_text='Ej: Tomate, Café, Papa, Maíz, Manzano')
    variety = models.CharField('Variedad', max_length=100, blank=True, help_text='Ej: Canchan, Caturra, Roma')
    planting_date = models.DateField('Fecha de Siembra')
    estimated_harvest_date = models.DateField('Fecha Estimada de Cosecha', null=True, blank=True)
    status = models.CharField('Estado del Cultivo', max_length=20, choices=STATUS_CHOICES, default='growing')
    image = models.ImageField('Foto del Cultivo', upload_to='crops/', blank=True, null=True)
    water_requirement = models.CharField('Frecuencia de Riego', max_length=100, default='Cada 2 días')
    sunlight_requirement = models.CharField('Exposición Solar', max_length=100, default='Pleno Sol')
    notes = models.TextField('Notas', blank=True)
    created_at = models.DateTimeField('Fecha de Registro', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)

    class Meta:
        verbose_name = 'Cultivo'
        verbose_name_plural = 'Cultivos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.species} - {self.name} ({self.plot.name})"


class CareEvent(models.Model):
    """Módulo 2: RF-04 Historial de Cuidados (riego, fertilizantes, podas, fumigaciones)."""
    EVENT_TYPES = (
        ('watering', 'Riego'),
        ('fertilization', 'Fertilización'),
        ('pruning', 'Poda'),
        ('fumigation', 'Fumigación / Tratamiento'),
        ('harvest', 'Cosecha'),
        ('monitoring', 'Monitoreo / Inspección'),
        ('other', 'Otro'),
    )

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='care_events',
        verbose_name='Cultivo'
    )
    event_type = models.CharField('Tipo de Cuidado', max_length=20, choices=EVENT_TYPES)
    title = models.CharField('Título / Acción', max_length=150)
    event_date = models.DateTimeField('Fecha y Hora del Evento')
    product_used = models.CharField('Producto / Abono Utilizado', max_length=150, blank=True)
    amount = models.CharField('Dosis / Cantidad', max_length=100, blank=True)
    notes = models.TextField('Observaciones', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Evento de Cuidado'
        verbose_name_plural = 'Historial de Cuidados'
        ordering = ['-event_date']

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.crop.name} ({self.event_date.strftime('%Y-%m-%d')})"


class StatusLog(models.Model):
    """Módulo 2: RF-05 Bitácora de Estado y Evolución."""
    LOG_STATUS_CHOICES = (
        ('healthy', 'Excelente / Saludable'),
        ('good', 'Bueno / Normal'),
        ('warning', 'Alerta / Síntomas Leves'),
        ('critical', 'Crítico / Plaga Avanzada'),
        ('recovered', 'Recuperado'),
    )

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='status_logs',
        verbose_name='Cultivo'
    )
    status = models.CharField('Estado', max_length=20, choices=LOG_STATUS_CHOICES, default='good')
    title = models.CharField('Título de la Entrada', max_length=150)
    observations = models.TextField('Observaciones de la Evolución')
    photo = models.ImageField('Foto de Estado', upload_to='status_logs/', blank=True, null=True)
    logged_at = models.DateTimeField('Fecha de Registro')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Entrada de Bitácora'
        verbose_name_plural = 'Bitácora de Estado'
        ordering = ['-logged_at']

    def __str__(self):
        return f"{self.crop.name} - {self.get_status_display()} ({self.logged_at.strftime('%Y-%m-%d')})"
