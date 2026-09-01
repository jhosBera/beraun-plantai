from rest_framework import serializers
from .models import ChatSession, ChatMessage
from apps.crops.serializers import CropListSerializer
from apps.diagnosis.serializers import DiagnosisSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('session', 'sent_at')

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    diagnosis_disease = serializers.CharField(source='diagnosis.disease_common_name', read_only=True)

    class Meta:
        model = ChatSession
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField(required=True)
