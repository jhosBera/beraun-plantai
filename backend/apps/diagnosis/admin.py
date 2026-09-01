from django.contrib import admin
from .models import Diagnosis

@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('disease_common_name', 'crop', 'user', 'confidence', 'severity', 'is_healthy', 'user_feedback', 'diagnosed_at')
    list_filter = ('is_healthy', 'severity', 'user_feedback', 'diagnosed_at')
    search_fields = ('disease_common_name', 'disease_scientific_name', 'crop__name', 'user__email')
    readonly_fields = ('diagnosed_at',)
