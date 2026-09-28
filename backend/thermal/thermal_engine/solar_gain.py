import math

def calculate_solar_gain(solar_radiation, window_area, roof_area, orientation):
    """
    Estimates solar heat gain in Watts.
    Assumptions:
    - Windows have a generic Solar Heat Gain Coefficient (SHGC) of 0.6.
    - Opaque roof has a generic absorptance / U-value factor (simplified to 5% of radiation transmitting).
    - Orientation affects the window exposed area. We model orientation effect as a sinusoidal 
      multiplier where South (180 deg) in Northern Hemisphere receives max heat gain (1.0), 
      and North (0 deg) receives minimum diffuse (0.3).
    """
    # Orientation factor (0 = North, 180 = South, 360 = North)
    # Cosine function mapping: cos(0) = 1, cos(180) = -1
    # We want max at 180, min at 0/360.
    # Factor = 0.65 - 0.35 * cos(radians) => gives 0.3 at North, 1.0 at South.
    rad = math.radians(orientation)
    orientation_factor = 0.65 - 0.35 * math.cos(rad)
    
    # Window solar gain: Q = Area * Radiation * SHGC * OrientationFactor
    window_shgc = 0.6
    window_gain = window_area * solar_radiation * window_shgc * orientation_factor
    
    # Roof solar gain: Absorbed heat transferring inside. 
    # Highly simplified as 5% of direct radiation incident on roof area.
    roof_transmission = 0.05
    roof_gain = roof_area * solar_radiation * roof_transmission
    
    total_solar_gain = window_gain + roof_gain
    
    return total_solar_gain
