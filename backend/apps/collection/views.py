from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count

from .models import CollectedPlant
from .serializers import (
    CollectedPlantSerializer,
    CollectedPlantCreateSerializer,
    PlantIdentifyRequestSerializer,
    PlantAnalysisResultSerializer,
)
from .services import botanical_ai_service

class CollectedPlantViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión completa del Álbum y Colección Botánica (CollectPlant).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['common_name', 'scientific_name', 'family', 'category', 'user_notes', 'location_found']
    ordering_fields = ['created_at', 'common_name', 'scientific_name', 'confidence']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = CollectedPlant.objects.filter(user=self.request.user)
        
        # Filtros opcionales por query params
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)

        toxicity_pets = self.request.query_params.get('toxicity_pets')
        if toxicity_pets is not None:
            if toxicity_pets.lower() in ['true', '1']:
                qs = qs.filter(toxicity_pets=True)
            elif toxicity_pets.lower() in ['false', '0']:
                qs = qs.filter(toxicity_pets=False)

        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return CollectedPlantCreateSerializer
        return CollectedPlantSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='identify')
    def identify_plant(self, request):
        """
        Endpoint para identificar una planta a partir de una foto enviada antes de guardarla.
        """
        serializer = PlantIdentifyRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image_file = serializer.validated_data['image']
        try:
            image_bytes = image_file.read()
            analysis = botanical_ai_service.analyze_plant_image(image_bytes)
            return Response(analysis, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Error al procesar la imagen botánica: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='stats')
    def collection_stats(self, request):
        """
        Retorna métricas estadísticas de la colección del usuario autenticado.
        """
        qs = CollectedPlant.objects.filter(user=request.user)
        total_plants = qs.count()
        distinct_families = qs.values('family').distinct().count()
        toxic_pets_count = qs.filter(toxicity_pets=True).count()
        toxic_humans_count = qs.filter(toxicity_humans=True).count()
        
        category_breakdown = list(
            qs.values('category').annotate(count=Count('id')).order_by('-count')
        )
        difficulty_breakdown = list(
            qs.values('difficulty').annotate(count=Count('id')).order_by('-count')
        )

        return Response({
            "total_plants": total_plants,
            "distinct_families": distinct_families,
            "toxic_pets_count": toxic_pets_count,
            "toxic_humans_count": toxic_humans_count,
            "category_breakdown": category_breakdown,
            "difficulty_breakdown": difficulty_breakdown,
        })
