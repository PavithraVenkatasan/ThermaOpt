def calculate_heating_requirement(t_in, t_out, total_ua, target_temp=22.0):
    """
    Calculates the required heating power (Watts) and energy (kWh/day) to maintain
    a target indoor temperature if the estimated indoor temperature falls below it.
    
    Q_req (Watts) = UA * (T_target - T_in_unheated)
    Assuming this power needs to be supplied continuously for 24 hours to get kWh.
    """
    if t_in >= target_temp:
        return {
            'power_w': 0.0,
            'energy_kwh_per_day': 0.0
        }
        
    # Required power to bridge the gap
    req_power_w = total_ua * (target_temp - t_in)
    
    # Energy per day in kWh
    # (Watts * 24 hours) / 1000
    energy_kwh = (req_power_w * 24.0) / 1000.0
    
    return {
        'power_w': req_power_w,
        'energy_kwh_per_day': energy_kwh
    }
