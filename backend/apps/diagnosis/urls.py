from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiagnosisViewSet

router = DefaultRouter()
router.register(r'diagnosis', DiagnosisViewSet, basename='diagnosis')

urlpatterns = [
    path('', include(router.urls)),
]
