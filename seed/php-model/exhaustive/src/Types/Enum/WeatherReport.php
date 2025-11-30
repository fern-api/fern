<?php

namespace Seed\Types\Enum;

enum WeatherReport
 : string {
    case Sunny = "SUNNY";
    case Cloudy = "CLOUDY";
    case Raining = "RAINING";
    case Snowing = "SNOWING";
}
