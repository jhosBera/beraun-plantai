from django.db import models
from django.conf import settings

class CollectedPlant(models.Model):
    """
    Modelo para la Colección Botánica Inteligente (CollectPlant integrado).
    Permite registrar y gestionar plantas identificadas por visión con IA Gemini.
    """
    CATEGORY_CHOICES = (
        ('Interior', 'Planta de Interior'),
        ('Exterior', 'Planta de Exterior'),
        ('Suculenta', 'Suculenta / Crasa'),
        ('Cactus', 'Cactus'),
        ('Flor', 'Planta con Flor'),
        ('Árbol', 'Árbol / Arbusto'),
        ('Medicinal', 'Hierba / Medicinal'),
        ('Huerto', 'Huerto / Comestible'),
        ('General', 'General / Otra'),
    )

    DIFFICULTY_CHOICES = (
        ('Fácil', 'Fácil'),
        ('Moderado', 'Moderado'),
        ('Difícil', 'Difícil'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='collected_plants',
        verbose_name='Coleccionista'
    )
    image = models.ImageField(
        'Fotografía de la Planta',
        upload_to='plant_collections/%Y/%m/'
    )
    
    # Taxonomía y Datos Generales
    common_name = models.CharField('Nombre Común', max_length=200, db_index=True)
    scientific_name = models.CharField('Nombre Científico', max_length=200, db_index=True)
    family = models.CharField('Familia Botánica', max_length=150, default='Desconocida')
    category = models.CharField('Categoría', max_length=100, default='General', db_index=True)
    origin = models.CharField('Origen Geográfico', max_length=200, blank=True, default='')
    description = models.TextField('Descripción Botánica', blank=True, default='')

    # Guía de Cuidados
    light_requirement = models.CharField('Requerimiento de Luz', max_length=250, blank=True, default='')
    watering_frequency = models.CharField('Frecuencia de Riego', max_length=250, blank=True, default='')
    temperature_range = models.CharField('Rango de Temperatura', max_length=100, blank=True, default='')
    humidity_requirement = models.CharField('Humedad Ambiental', max_length=100, blank=True, default='')
    difficulty = models.CharField('Dificultad de Cuidado', max_length=50, default='Moderado')

    # Toxicidad y Seguridad
    toxicity_pets = models.BooleanField('Tóxica para Mascotas (Perros/Gatos)', default=False)
    toxicity_humans = models.BooleanField('Tóxica para Humanos / Niños', default=False)
    toxicity_details = models.TextField('Detalles de Toxicidad', blank=True, default='')

    # Curiosidades y Certeza
    fun_facts = models.TextField('Curiosidades e Historia', blank=True, default='')
    confidence = models.FloatField('Nivel de Confianza IA (0.0 - 1.0)', default=0.95)

    # Registro de Campo por el Usuario
    user_notes = models.TextField('Notas de Campo del Usuario', blank=True, null=True)
    location_found = models.CharField('Lugar de Hallazgo / Ubicación', max_length=255, blank=True, null=True)

    created_at = models.DateTimeField('Fecha de Colección', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)

    class Meta:
        verbose_name = 'Planta Coleccionada'
        verbose_name_plural = 'Álbum de Plantas Coleccionadas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.common_name} ({self.scientific_name}) - {self.user.username}"
