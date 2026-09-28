from django.db import models

class ClimateData(models.Model):
    location_name = models.CharField(max_length=100)
    avg_temperature_c = models.FloatField()
    solar_radiation_wm2 = models.FloatField()
    wind_speed_ms = models.FloatField()
    
    def __str__(self):
        return self.location_name

class Material(models.Model):
    name = models.CharField(max_length=100)
    thermal_conductivity = models.FloatField(help_text="W/(m·K)")
    density = models.FloatField(help_text="kg/m³")
    specific_heat = models.FloatField(help_text="J/(kg·K)")
    
    def __str__(self):
        return self.name

class InsulationMaterial(models.Model):
    name = models.CharField(max_length=100)
    r_value_per_inch = models.FloatField()
    
    def __str__(self):
        return self.name

class ShelterDesign(models.Model):
    SHAPE_CHOICES = [
        ('rectangular', 'Rectangular'),
        ('a_frame', 'A-Frame'),
        ('dome', 'Dome'),
    ]
    name = models.CharField(max_length=100)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES, default='rectangular')
    length = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    orientation = models.FloatField(help_text="Degrees from North")
    wall_material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, related_name='wall_designs')
    roof_material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, related_name='roof_designs')
    insulation = models.ForeignKey(InsulationMaterial, on_delete=models.SET_NULL, null=True, blank=True)
    insulation_thickness = models.FloatField(default=0.0)
    window_area = models.FloatField(default=0.0)
    door_area = models.FloatField(default=0.0)
    
    def __str__(self):
        return self.name

class Simulation(models.Model):
    design = models.ForeignKey(ShelterDesign, on_delete=models.CASCADE)
    climate = models.ForeignKey(ClimateData, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Sim: {self.design.name} in {self.climate.location_name}"

class SimulationResult(models.Model):
    simulation = models.OneToOneField(Simulation, on_delete=models.CASCADE, related_name='result')
    indoor_temperature_c = models.FloatField()
    heat_loss_w = models.FloatField()
    solar_heat_gain_w = models.FloatField()
    heating_requirement_kwh = models.FloatField()
    thermal_comfort_score = models.FloatField(help_text="0-100 score")
    
    def __str__(self):
        return f"Result for {self.simulation}"
