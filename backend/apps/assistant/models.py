from django.db import models
from django.conf import settings
from apps.crops.models import Crop
from apps.diagnosis.models import Diagnosis

class ChatSession(models.Model):
    """Módulo 4: Sesión de conversación con el Asistente Botánico."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions',
        verbose_name='Usuario'
    )
    crop = models.ForeignKey(
        Crop,
        on_delete=models.SET_NULL,
        related_name='chat_sessions',
        null=True,
        blank=True,
        verbose_name='Cultivo en Consulta'
    )
    diagnosis = models.ForeignKey(
        Diagnosis,
        on_delete=models.SET_NULL,
        related_name='chat_sessions',
        null=True,
        blank=True,
        verbose_name='Diagnóstico Asociado'
    )
    title = models.CharField('Título de la Consulta', max_length=200, default='Consulta Agronómica')
    created_at = models.DateTimeField('Fecha de Inicio', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actividad', auto_now=True)

    class Meta:
        verbose_name = 'Sesión de Chat IA'
        verbose_name_plural = 'Sesiones de Chat IA'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.user.email})"


class ChatMessage(models.Model):
    """Módulo 4: Mensaje dentro de la conversación del Chatbot Asesor."""
    ROLE_CHOICES = (
        ('user', 'Usuario / Agricultor'),
        ('assistant', 'Asistente Botánico IA'),
        ('system', 'Instrucción del Sistema'),
    )

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name='Sesión'
    )
    role = models.CharField('Emisor', max_length=20, choices=ROLE_CHOICES)
    content = models.TextField('Contenido del Mensaje')
    suggested_actions = models.JSONField(
        'Acciones Sugeridas (Tratamiento / Calendario)',
        default=dict,
        blank=True
    )
    sent_at = models.DateTimeField('Fecha de Envío', auto_now_add=True)

    class Meta:
        verbose_name = 'Mensaje de Chat'
        verbose_name_plural = 'Mensajes de Chat'
        ordering = ['sent_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:40]}..."
