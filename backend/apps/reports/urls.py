from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertViewSet, NotificationViewSet, ExportCropPDFView

router = DefaultRouter()
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('reports/crops/<int:crop_id>/pdf/', ExportCropPDFView.as_view(), name='export_crop_pdf'),
    path('', include(router.urls)),
]
