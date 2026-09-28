from rest_framework import serializers
from .models import ClimateData, Material, InsulationMaterial, ShelterDesign, Simulation, SimulationResult

class ClimateDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClimateData
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class InsulationMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsulationMaterial
        fields = '__all__'

class ShelterDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterDesign
        fields = '__all__'

class SimulationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationResult
        fields = '__all__'
        read_only_fields = ['simulation']

class SimulationSerializer(serializers.ModelSerializer):
    result = SimulationResultSerializer(read_only=True)
    
    class Meta:
        model = Simulation
        fields = '__all__'

class SimulationRequestSerializer(serializers.Serializer):
    climate_id = serializers.IntegerField()
    design_id = serializers.IntegerField()
