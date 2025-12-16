<?php

namespace Seed\Types\Enum\Types;

enum WeatherReport: string
{
    case Sunny = "SUNNY";
    case Cloudy = "CLOUDY";
    case Raining = "RAINING";
    case Snowing = "SNOWING";
}
