from rest_framework import serializers
from .models import Alert, Notification
from apps.crops.models import Crop

class AlertSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    crop_species = serializers.CharField(source='crop.species', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ('user', 'is_sent', 'last_triggered_at', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'alert', 'title', 'message', 'notification_type', 'link_url', 'created_at')
