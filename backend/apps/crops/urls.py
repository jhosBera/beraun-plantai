from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlotViewSet, CropViewSet, CareEventViewSet, StatusLogViewSet

router = DefaultRouter()
router.register(r'plots', PlotViewSet, basename='plot')
router.register(r'crops', CropViewSet, basename='crop')
router.register(r'care-events', CareEventViewSet, basename='care-event')
router.register(r'status-logs', StatusLogViewSet, basename='status-log')

urlpatterns = [
    path('', include(router.urls)),
]
