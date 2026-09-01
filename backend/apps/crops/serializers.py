from rest_framework import serializers
from .models import Plot, Crop, CareEvent, StatusLog

class CareEventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = CareEvent
        fields = '__all__'

class StatusLogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = StatusLog
        fields = '__all__'

class CropListSerializer(serializers.ModelSerializer):
    plot_name = serializers.CharField(source='plot.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    care_events_count = serializers.IntegerField(source='care_events.count', read_only=True)
    diagnoses_count = serializers.IntegerField(source='diagnoses.count', read_only=True)

    class Meta:
        model = Crop
        fields = '__all__'

class CropDetailSerializer(serializers.ModelSerializer):
    plot_name = serializers.CharField(source='plot.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    care_events = CareEventSerializer(many=True, read_only=True)
    status_logs = StatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Crop
        fields = '__all__'

class PlotSerializer(serializers.ModelSerializer):
    crops_count = serializers.IntegerField(source='crops.count', read_only=True)
    crops = CropListSerializer(many=True, read_only=True)

    class Meta:
        model = Plot
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
