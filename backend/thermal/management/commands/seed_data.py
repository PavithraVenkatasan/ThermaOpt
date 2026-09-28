from django.core.management.base import BaseCommand
from thermal.models import ClimateData, Material, InsulationMaterial


class Command(BaseCommand):
    help = "Add sample climate, material and insulation data"

    def handle(self, *args, **options):

        # Climate data
        climates = [
            {
                "location_name": "Chennai",
                "avg_temperature_c": 30.5,
                "solar_radiation_wm2": 520,
                "wind_speed_ms": 3.2,
            },
            {
                "location_name": "Delhi",
                "avg_temperature_c": 25.0,
                "solar_radiation_wm2": 480,
                "wind_speed_ms": 2.4,
            },
            {
                "location_name": "Bengaluru",
                "avg_temperature_c": 23.0,
                "solar_radiation_wm2": 430,
                "wind_speed_ms": 2.8,
            },
            {
                "location_name": "Hyderabad",
                "avg_temperature_c": 27.0,
                "solar_radiation_wm2": 500,
                "wind_speed_ms": 3.0,
            },
            {
                "location_name": "Jaipur",
                "avg_temperature_c": 28.0,
                "solar_radiation_wm2": 550,
                "wind_speed_ms": 2.1,
            },
        ]

        for data in climates:
            ClimateData.objects.update_or_create(
                location_name=data["location_name"],
                defaults=data,
            )

        # Construction materials
        materials = [
            {
                "name": "Concrete",
                "thermal_conductivity": 1.70,
                "density": 2400,
                "specific_heat": 880,
            },
            {
                "name": "Brick",
                "thermal_conductivity": 0.72,
                "density": 1800,
                "specific_heat": 840,
            },
            {
                "name": "Compressed Earth Block",
                "thermal_conductivity": 0.60,
                "density": 1700,
                "specific_heat": 900,
            },
            {
                "name": "Timber",
                "thermal_conductivity": 0.14,
                "density": 600,
                "specific_heat": 1600,
            },
            {
                "name": "Bamboo Panel",
                "thermal_conductivity": 0.20,
                "density": 700,
                "specific_heat": 1500,
            },
        ]

        for data in materials:
            Material.objects.update_or_create(
                name=data["name"],
                defaults=data,
            )

        # Insulation materials
        insulation = [
            {
                "name": "Mineral Wool",
                "r_value_per_inch": 3.7,
            },
            {
                "name": "Expanded Polystyrene",
                "r_value_per_inch": 4.0,
            },
            {
                "name": "Extruded Polystyrene",
                "r_value_per_inch": 5.0,
            },
            {
                "name": "Cellulose",
                "r_value_per_inch": 3.5,
            },
            {
                "name": "Cork",
                "r_value_per_inch": 3.6,
            },
        ]

        for data in insulation:
            InsulationMaterial.objects.update_or_create(
                name=data["name"],
                defaults=data,
            )

        self.stdout.write(
            self.style.SUCCESS(
                "ThermaOpt sample data added successfully!"
            )
        )