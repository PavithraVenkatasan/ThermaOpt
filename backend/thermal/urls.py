from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'climate', views.ClimateDataViewSet, basename='climate')
router.register(r'materials', views.MaterialViewSet, basename='material')
router.register(r'insulation', views.InsulationMaterialViewSet, basename='insulation')
router.register(r'designs', views.ShelterDesignViewSet, basename='design')
router.register(r'simulations', views.SimulationViewSet, basename='simulation')

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('simulate/', views.simulate_endpoint, name='simulate'),
    path('optimize/', views.optimize_endpoint, name='optimize'),
    path('', include(router.urls)),
]
