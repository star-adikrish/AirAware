
import math


# Validate US AQI values
def validate_aqi(value):

    if value is None:
        return False

    try:
                aqi = float(value)
    except (TypeError, ValueError):
        return False

    if not math.isfinite(aqi):
        return False

    if not 0 <= aqi <= 500:
        return False

    return True


# Get AQI health category
def get_aqi_category(aqi):

    if not validate_aqi(aqi):
        return "Unavailable"
    
    aqi = float(aqi)

    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def validate_pollutant(value):

    if value is None:
        return False

    try:
        reading = float(value)
    except (TypeError, ValueError):
        return False

    return math.isfinite(reading) and reading >= 0


# Validate complete air quality data
def validate_air_quality(data):

    if not isinstance(data, dict):
        return False

    current = data.get("current")

    if not isinstance(current, dict):
        return False

    aqi = current.get("us_aqi")

    if not validate_aqi(aqi):
        return False

    pollutants = [
        "pm2_5",
        "pm10",
        "carbon_monoxide",
        "nitrogen_dioxide",
        "sulphur_dioxide",
        "ozone"
    ]
