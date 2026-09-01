from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Plot, Crop, CareEvent, StatusLog
from .serializers import (
    PlotSerializer, CropListSerializer, CropDetailSerializer,
    CareEventSerializer, StatusLogSerializer
)

class PlotViewSet(viewsets.ModelViewSet):
    serializer_class = PlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'soil_type']
    ordering_fields = ['created_at', 'name', 'area_hectares']

    def get_queryset(self):
        return Plot.objects.filter(user=self.request.user).prefetch_related('crops')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CropViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'species', 'variety', 'status']
    ordering_fields = ['planting_date', 'created_at', 'name', 'status']

    def get_queryset(self):
        qs = Crop.objects.filter(plot__user=self.request.user).select_related('plot')
        plot_id = self.request.query_params.get('plot')
        if plot_id:
            qs = qs.filter(plot_id=plot_id)
        species = self.request.query_params.get('species')
        if species:
            qs = qs.filter(species__icontains=species)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CropDetailSerializer
        return CropListSerializer


class CareEventViewSet(viewsets.ModelViewSet):
    serializer_class = CareEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['event_date', 'created_at']

    def get_queryset(self):
        qs = CareEvent.objects.filter(crop__plot__user=self.request.user).select_related('crop')
        crop_id = self.request.query_params.get('crop')
        if crop_id:
            qs = qs.filter(crop_id=crop_id)
        event_type = self.request.query_params.get('event_type')
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs


class StatusLogViewSet(viewsets.ModelViewSet):
    serializer_class = StatusLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['logged_at', 'created_at']

    def get_queryset(self):
        qs = StatusLog.objects.filter(crop__plot__user=self.request.user).select_related('crop')
        crop_id = self.request.query_params.get('crop')
        if crop_id:
            qs = qs.filter(crop_id=crop_id)
        return qs
