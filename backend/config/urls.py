from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "status": "ok",
        "message": "ThermaOpt backend is running.",
        "api": "/api/",
        "health": "/api/health/"
    })


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('thermal.urls')),
]