from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollectedPlantViewSet

router = DefaultRouter()
router.register(r'plants', CollectedPlantViewSet, basename='collected-plant')

urlpatterns = [
    path('', include(router.urls)),
]
