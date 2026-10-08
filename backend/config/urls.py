from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

def health_check(request):
    return JsonResponse({"status": "ok", "service": "Beraun PlantAI API", "version": "1.0.0"})

urlpatterns = [
    path('', health_check, name='health-root'),
    path('health/', health_check, name='health'),
    path('admin/', admin.site.urls),
    
    # OpenAPI Schema & Swagger Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Modular API endpoints
    path('api/auth/', include('apps.users.urls_auth')),
    path('api/users/', include('apps.users.urls')),
    path('api/', include('apps.crops.urls')),
    path('api/', include('apps.diagnosis.urls')),
    path('api/', include('apps.assistant.urls')),
    path('api/', include('apps.reports.urls')),
    path('api/v1/collection/', include('apps.collection.urls')),
    path('api/collection/', include('apps.collection.urls')),
    
    # Media files serving
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

