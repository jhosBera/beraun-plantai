from django.contrib import admin
from .models import CollectedPlant

@admin.register(CollectedPlant)
class CollectedPlantAdmin(admin.ModelAdmin):
    list_display = ('common_name', 'scientific_name', 'family', 'category', 'difficulty', 'user', 'created_at')
    list_filter = ('category', 'difficulty', 'toxicity_pets', 'toxicity_humans', 'created_at')
    search_fields = ('common_name', 'scientific_name', 'family', 'user__username', 'user__email', 'user_notes')
    ordering = ('-created_at',)
