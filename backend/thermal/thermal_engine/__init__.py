from .heat_loss import calculate_surface_areas, calculate_u_value, calculate_conductive_heat_loss
from .solar_gain import calculate_solar_gain
from .indoor_temperature import estimate_indoor_temperature
from .heating_requirement import calculate_heating_requirement
from .comfort import calculate_comfort_score

def run_simulation(climate, shelter):
    """
    Executes the full thermal engine pipeline.
    
    climate: dict with avg_temperature_c, solar_radiation_wm2, wind_speed_ms
    shelter: dict with shape, length, width, height, orientation, 
             window_area, door_area, wall_material, roof_material, insulation
    """
    # 1. Surface Areas
    areas = calculate_surface_areas(
        shape=shelter['shape'],
        length=shelter['length'],
        width=shelter['width'],
        height=shelter['height'],
        window_area=shelter['window_area'],
        door_area=shelter['door_area']
    )
    
    # 2. U-values & Thermal Mass
    # Assuming wall material density and specific heat are provided
    wall_mat = shelter['wall_material']
    roof_mat = shelter['roof_material']
    insul = shelter.get('insulation')
    insul_r_value = insul['r_value_per_inch'] if insul else 0.0
    insul_thick = shelter.get('insulation_thickness', 0.0)
    
    wall_u = calculate_u_value(wall_mat['thermal_conductivity'], insul_r_value, insul_thick)
    roof_u = calculate_u_value(roof_mat['thermal_conductivity'], insul_r_value, insul_thick)
    
    # Simple window and door U-values
    window_u = 3.0 # Double glazed assumed
    door_u = 2.0
    
    # Total UA (W/K)
    total_ua = (
        (wall_u * areas['wall']) +
        (roof_u * areas['roof']) +
        (window_u * areas['window']) +
        (door_u * areas['door'])
    )
    
    # Thermal Mass Calculation (Joules / Kelvin)
    # Mass = Density * Volume * Specific Heat
    # Approximate wall volume = wall area * 0.2m thickness
    wall_volume = areas['wall'] * 0.2
    thermal_mass = wall_volume * wall_mat['density'] * wall_mat['specific_heat']
    
    # 3. Solar Gain
    solar_gain = calculate_solar_gain(
        solar_radiation=climate['solar_radiation_wm2'],
        window_area=areas['window'],
        roof_area=areas['roof'],
        orientation=shelter['orientation']
    )
    
    # 4. Indoor Temperature Estimate
    t_out = climate['avg_temperature_c']
    t_in = estimate_indoor_temperature(
        t_out=t_out,
        total_solar_gain=solar_gain,
        total_ua=total_ua,
        thermal_mass=thermal_mass
    )
    
    # 5. Conductive Heat Loss
    # We calculate the nominal heat loss at a reference indoor temperature (e.g., 20°C)
    # to provide a standard metric of the building envelope's performance.
    reference_t_in = 20.0
    heat_loss = max(0, total_ua * (reference_t_in - t_out))
    
    # 6. Heating Requirement
    heating = calculate_heating_requirement(t_in, t_out, total_ua)
    
    # 7. Comfort Score
    comfort = calculate_comfort_score(t_in)
    
    return {
        'indoor_temperature_c': round(t_in, 2),
        'heat_loss_w': round(heat_loss, 2),
        'solar_heat_gain_w': round(solar_gain, 2),
        'heating_requirement_kwh': round(heating['energy_kwh_per_day'], 2),
        'thermal_comfort_score': round(comfort, 2)
    }
