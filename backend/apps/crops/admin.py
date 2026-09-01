from django.contrib import admin
from .models import Plot, Crop, CareEvent, StatusLog

@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'location', 'area_hectares', 'soil_type', 'created_at')
    list_filter = ('created_at', 'soil_type')
    search_fields = ('name', 'location', 'user__email')

@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'variety', 'plot', 'planting_date', 'status', 'created_at')
    list_filter = ('species', 'status', 'planting_date')
    search_fields = ('name', 'species', 'variety', 'plot__name')

@admin.register(CareEvent)
class CareEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'crop', 'event_type', 'event_date', 'product_used', 'amount')
    list_filter = ('event_type', 'event_date')
    search_fields = ('title', 'crop__name', 'product_used')

@admin.register(StatusLog)
class StatusLogAdmin(admin.ModelAdmin):
    list_display = ('title', 'crop', 'status', 'logged_at')
    list_filter = ('status', 'logged_at')
    search_fields = ('title', 'crop__name', 'observations')
