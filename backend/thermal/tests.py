from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import ClimateData, Material, InsulationMaterial, ShelterDesign, Simulation
from .thermal_engine import run_simulation

class ThermalEngineTests(TestCase):
    def setUp(self):
        self.climate = {
            'avg_temperature_c': 5.0,
            'solar_radiation_wm2': 300.0,
            'wind_speed_ms': 2.0
        }
        self.shelter = {
            'shape': 'rectangular',
            'length': 5.0,
            'width': 4.0,
            'height': 3.0,
            'orientation': 180.0, # South facing
            'window_area': 2.0,
            'door_area': 2.0,
            'wall_material': {
                'thermal_conductivity': 1.5, # concrete
                'density': 2400.0,
                'specific_heat': 880.0
            },
            'roof_material': {
                'thermal_conductivity': 0.1, # wood
                'density': 500.0,
                'specific_heat': 1200.0
            },
            'insulation': None,
            'insulation_thickness': 0.0
        }

    def test_increasing_insulation_reduces_heat_loss(self):
        # Baseline
        res1 = run_simulation(self.climate, self.shelter)
        
        # Add insulation
        shelter2 = self.shelter.copy()
        shelter2['insulation'] = {'r_value_per_inch': 3.0}
        shelter2['insulation_thickness'] = 0.1 # 10cm
        res2 = run_simulation(self.climate, shelter2)
        
        # Heat loss should be lower
        self.assertLess(res2['heat_loss_w'], res1['heat_loss_w'])

    def test_changing_wall_material_changes_heat_loss(self):
        res1 = run_simulation(self.climate, self.shelter)
        
        shelter2 = self.shelter.copy()
        # Change to a highly conductive material like steel (fake for test)
        shelter2['wall_material'] = {
            'thermal_conductivity': 50.0, 
            'density': 7800.0,
            'specific_heat': 450.0
        }
        res2 = run_simulation(self.climate, shelter2)
        
        # Heat loss should change (increase)
        self.assertNotEqual(res1['heat_loss_w'], res2['heat_loss_w'])
        self.assertGreater(res2['heat_loss_w'], res1['heat_loss_w'])

    def test_changing_outdoor_temperature_changes_result(self):
        res1 = run_simulation(self.climate, self.shelter)
        
        climate2 = self.climate.copy()
        climate2['avg_temperature_c'] = -10.0
        res2 = run_simulation(climate2, self.shelter)
        
        self.assertNotEqual(res1['indoor_temperature_c'], res2['indoor_temperature_c'])
        self.assertLess(res2['indoor_temperature_c'], res1['indoor_temperature_c'])

    def test_changing_solar_radiation_changes_solar_gain(self):
        res1 = run_simulation(self.climate, self.shelter)
        
        climate2 = self.climate.copy()
        climate2['solar_radiation_wm2'] = 800.0
        res2 = run_simulation(climate2, self.shelter)
        
        self.assertGreater(res2['solar_heat_gain_w'], res1['solar_heat_gain_w'])

    def test_changing_shelter_dimensions_changes_heat_loss(self):
        res1 = run_simulation(self.climate, self.shelter)
        
        shelter2 = self.shelter.copy()
        shelter2['length'] = 10.0 # Make it bigger
        res2 = run_simulation(self.climate, shelter2)
        
        # Larger area means more heat loss
        self.assertGreater(res2['heat_loss_w'], res1['heat_loss_w'])

    def test_changing_orientation_affects_solar_gain(self):
        # 180 is South (max gain)
        res_south = run_simulation(self.climate, self.shelter)
        
        shelter_north = self.shelter.copy()
        shelter_north['orientation'] = 0.0 # North (min gain)
        res_north = run_simulation(self.climate, shelter_north)
        
        self.assertLess(res_north['solar_heat_gain_w'], res_south['solar_heat_gain_w'])

    def test_changing_window_area_affects_heat_transfer(self):
        res1 = run_simulation(self.climate, self.shelter)
        
        shelter2 = self.shelter.copy()
        shelter2['window_area'] = 10.0 # More windows
        res2 = run_simulation(self.climate, shelter2)
        
        # More windows means higher solar gain and higher heat loss
        self.assertGreater(res2['solar_heat_gain_w'], res1['solar_heat_gain_w'])
        self.assertNotEqual(res1['heat_loss_w'], res2['heat_loss_w'])

class ApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.climate = ClimateData.objects.create(
            location_name='Test City',
            avg_temperature_c=10.0,
            solar_radiation_wm2=400.0,
            wind_speed_ms=1.5
        )
        self.material = Material.objects.create(
            name='Test Brick',
            thermal_conductivity=0.6,
            density=1900.0,
            specific_heat=800.0
        )
        self.insulation = InsulationMaterial.objects.create(
            name='Test Foam',
            r_value_per_inch=5.0
        )
        self.design = ShelterDesign.objects.create(
            name='Test Design',
            shape='rectangular',
            length=6.0,
            width=5.0,
            height=3.0,
            orientation=90.0,
            wall_material=self.material,
            roof_material=self.material,
            insulation=self.insulation,
            insulation_thickness=0.05,
            window_area=3.0,
            door_area=2.0
        )

    def test_simulate_endpoint(self):
        url = reverse('simulate')
        data = {
            'climate_id': self.climate.id,
            'design_id': self.design.id
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check response contains calculated metrics
        self.assertIn('result', response.data)
        self.assertIn('indoor_temperature_c', response.data['result'])
        self.assertIn('heat_loss_w', response.data['result'])
        self.assertIn('thermal_comfort_score', response.data['result'])
        
        # Verify saved in DB
        self.assertEqual(Simulation.objects.count(), 1)
        sim = Simulation.objects.first()
        self.assertEqual(sim.design.id, self.design.id)
        self.assertIsNotNone(sim.result)
        self.assertEqual(sim.result.indoor_temperature_c, response.data['result']['indoor_temperature_c'])
