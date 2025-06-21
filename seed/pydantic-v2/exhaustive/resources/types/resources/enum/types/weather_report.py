from typing import TypeVar
from enum import Enum

class WeatherReport(Enum):
    Sunny = "SUNNY"
    Cloudy = "CLOUDY"
    Raining = "RAINING"
    Snowing = "SNOWING"
def visit(
    self,
    Sunny = "SUNNY": typing.Callable[[], T_Result],
    Cloudy = "CLOUDY": typing.Callable[[], T_Result],
    Raining = "RAINING": typing.Callable[[], T_Result],
    Snowing = "SNOWING": typing.Callable[[], T_Result]
    ) -> T_Result:
    if self is WeatherReport.Sunny = "SUNNY":
        return Sunny = "SUNNY"()
    if self is WeatherReport.Cloudy = "CLOUDY":
        return Cloudy = "CLOUDY"()
    if self is WeatherReport.Raining = "RAINING":
        return Raining = "RAINING"()
    if self is WeatherReport.Snowing = "SNOWING":
        return Snowing = "SNOWING"()

