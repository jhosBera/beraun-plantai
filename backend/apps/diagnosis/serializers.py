from rest_framework import serializers
from .models import Diagnosis
from apps.crops.models import Crop

class DiagnosisSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    crop_species = serializers.CharField(source='crop.species', read_only=True)
    plot_name = serializers.CharField(source='crop.plot.name', read_only=True)

    class Meta:
        model = Diagnosis
        fields = '__all__'
        read_only_fields = (
            'user', 'disease_common_name', 'disease_scientific_name',
            'confidence', 'severity', 'is_healthy', 'symptoms',
            'treatment_plan', 'top_predictions', 'diagnosed_at'
        )

class DiagnosisCreateSerializer(serializers.ModelSerializer):
    crop_id = serializers.PrimaryKeyRelatedField(
        queryset=Crop.objects.all(),
        source='crop',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Diagnosis
        fields = ('image', 'crop_id')
