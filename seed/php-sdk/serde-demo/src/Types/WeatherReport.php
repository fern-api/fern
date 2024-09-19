<?php

namespace Seed\Types;

enum WeatherReport: string
{
    case CLEAR = "clear";
    case CLOUDY = "cloudy";
    case RAINY = "rainy";
    case SNOWY = "snowy";
    case WINDY = "windy";
    case THUNDERSTORM = "thunderstorm";
}

