import math

def calculate_surface_areas(shape, length, width, height, window_area, door_area):
    """
    Approximates surface areas based on geometric shape.
    Returns a dictionary of areas in square meters.
    """
    if shape == 'rectangular':
        # Walls: 2 * (L*H + W*H)
        gross_wall_area = 2 * (length * height + width * height)
        roof_area = length * width
    elif shape == 'a_frame':
        # Assuming an A-frame triangle profile on the width, extending along length
        # Slanted roof acts as both roof and major wall. Let's treat the gable ends as walls.
        # Height is the peak height from the center of the width.
        slant_length = math.sqrt((width / 2)**2 + height**2)
        roof_area = 2 * (slant_length * length)
        gross_wall_area = 2 * (0.5 * width * height) # Front and back gables
    elif shape == 'dome':
        # Assume a hemisphere with radius R = width / 2
        r = width / 2
        dome_area = 2 * math.pi * r**2
        # For simplicity, split dome area evenly into "wall" and "roof" components 
        # or treat all as roof. We'll split it.
        gross_wall_area = dome_area * 0.5
        roof_area = dome_area * 0.5
    else:
        gross_wall_area = 2 * (length * height + width * height)
        roof_area = length * width

    net_wall_area = max(0, gross_wall_area - window_area - door_area)
    
    return {
        'wall': net_wall_area,
        'roof': roof_area,
        'window': window_area,
        'door': door_area
    }

def calculate_u_value(material_conductivity, insulation_r_value, insulation_thickness):
    """
    Calculates U-value (W/m²K) based on material conductivity and insulation.
    Assumptions:
    - Base wall material thickness is assumed to be 0.2m for thermal resistance.
    - Air film resistance (inside + outside) is approximately 0.17 m²K/W.
    - insulation_r_value is treated as standard RSI per meter (adjusted by thickness).
    """
    # Base material resistance: R = d / k
    # Assuming 0.2m standard thickness for base structural material
    base_r = 0.2 / material_conductivity if material_conductivity > 0 else 0
    
    # Insulation resistance (Assuming input r_value_per_inch acts as RSI * 39.37, 
    # but for prototype simplicity we'll treat it as R = r_value * thickness)
    insul_r = insulation_r_value * insulation_thickness
    
    # Air film resistance
    air_film_r = 0.17
    
    total_r = base_r + insul_r + air_film_r
    
    return 1.0 / total_r if total_r > 0 else 5.0 # Fallback high U-value if 0 resistance

def calculate_conductive_heat_loss(u_value, area, t_in, t_out):
    """
    Conductive heat loss Q = U * A * (T_in - T_out)
    Result in Watts.
    """
    return u_value * area * (t_in - t_out)
