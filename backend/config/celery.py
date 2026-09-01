import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('plantai')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Periodic task schedules
app.conf.beat_schedule = {
    'check-scheduled-alerts-every-5-minutes': {
        'task': 'apps.reports.tasks.check_pending_alerts',
        'schedule': 300.0, # every 5 minutes
    },
}
