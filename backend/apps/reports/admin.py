from django.contrib import admin
from .models import Alert, Notification

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'crop', 'user', 'alert_type', 'scheduled_for', 'recurrence_days', 'is_active', 'is_sent')
    list_filter = ('alert_type', 'is_active', 'is_sent', 'scheduled_for')
    search_fields = ('title', 'crop__name', 'user__email')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__email')
