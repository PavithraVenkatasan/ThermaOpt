def compare_designs(results_list):
    """
    Given a list of simulation results, identifies the best performing design.
    The primary metric for optimization is the Thermal Comfort Score.
    Secondary metric is Heating Requirement (lower is better).
    """
    if not results_list:
        return None
        
    best_result = sorted(
        results_list,
        key=lambda r: (r['thermal_comfort_score'], -r['heating_requirement_kwh']),
        reverse=True
    )[0]
    
    return best_result
