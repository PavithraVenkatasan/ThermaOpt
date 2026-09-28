def calculate_comfort_score(t_in):
    """
    Calculates a 0-100 thermal comfort score based on indoor temperature.
    
    Assumptions:
    - Ideal comfort temperature is 22°C (Score = 100).
    - Comfort drops linearly as temperature deviates from 22°C.
    - A penalty of 8 points per degree of deviation.
    - Minimum score is 0.
    """
    ideal_temp = 22.0
    deviation = abs(t_in - ideal_temp)
    
    # 8 points penalty per degree C
    score = 100.0 - (deviation * 8.0)
    
    # Clamp between 0 and 100
    score = max(0.0, min(100.0, score))
    
    return score
