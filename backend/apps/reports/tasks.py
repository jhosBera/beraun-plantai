from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Alert, Notification

@shared_task(name="apps.reports.tasks.check_pending_alerts")
def check_pending_alerts():
    """
    Tarea periódica de Celery que revisa alertas programadas de riego y cuidados (RF-14).
    Genera notificaciones in-app cuando la fecha programada ha llegado.
    """
    now = timezone.now()
    pending_alerts = Alert.objects.filter(
        is_active=True,
        scheduled_for__lte=now
    ).select_related('user', 'crop')

    processed_count = 0

    for alert in pending_alerts:
        # 1. Crear notificación in-app
        icon_type = 'reminder'
        if alert.alert_type == 'disease_check':
            icon_type = 'warning'

        Notification.objects.create(
            user=alert.user,
            alert=alert,
            title=f"Recordatorio: {alert.title}",
            message=f"Es momento de realizar {alert.get_alert_type_display().lower()} en tu cultivo de {alert.crop.species} ({alert.crop.name}). {alert.description}",
            notification_type=icon_type,
            link_url=f"/crops/{alert.crop.id}"
        )

        alert.last_triggered_at = now
        
        # 2. Manejar recurrencia
        if alert.recurrence_days > 0:
            alert.scheduled_for = now + timedelta(days=alert.recurrence_days)
            alert.is_sent = False
        else:
            alert.is_sent = True
            alert.is_active = False
            
        alert.save(update_fields=['last_triggered_at', 'scheduled_for', 'is_sent', 'is_active'])
        processed_count += 1

    return f"Procesadas {processed_count} alertas programadas."
