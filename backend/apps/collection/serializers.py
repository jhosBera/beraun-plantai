from rest_framework import serializers
from .models import CollectedPlant

class CollectedPlantSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CollectedPlant
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'image',
            'image_url',
            'common_name',
            'scientific_name',
            'family',
            'category',
            'origin',
            'description',
            'light_requirement',
            'watering_frequency',
            'temperature_range',
            'humidity_requirement',
            'difficulty',
            'toxicity_pets',
            'toxicity_humans',
            'toxicity_details',
            'fun_facts',
            'confidence',
            'user_notes',
            'location_found',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class CollectedPlantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectedPlant
        fields = [
            'image',
            'common_name',
            'scientific_name',
            'family',
            'category',
            'origin',
            'description',
            'light_requirement',
            'watering_frequency',
            'temperature_range',
            'humidity_requirement',
            'difficulty',
            'toxicity_pets',
            'toxicity_humans',
            'toxicity_details',
            'fun_facts',
            'confidence',
            'user_notes',
            'location_found',
        ]

class PlantIdentifyRequestSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)

class PlantAnalysisResultSerializer(serializers.Serializer):
    is_plant = serializers.BooleanField()
    common_name = serializers.CharField()
    scientific_name = serializers.CharField()
    family = serializers.CharField()
    category = serializers.CharField()
    origin = serializers.CharField(allow_blank=True)
    description = serializers.CharField(allow_blank=True)
    light_requirement = serializers.CharField(allow_blank=True)
    watering_frequency = serializers.CharField(allow_blank=True)
    temperature_range = serializers.CharField(allow_blank=True)
    humidity_requirement = serializers.CharField(allow_blank=True)
    difficulty = serializers.CharField()
    toxicity_pets = serializers.BooleanField()
    toxicity_humans = serializers.BooleanField()
    toxicity_details = serializers.CharField(allow_blank=True)
    fun_facts = serializers.CharField(allow_blank=True)
    confidence = serializers.FloatField()
