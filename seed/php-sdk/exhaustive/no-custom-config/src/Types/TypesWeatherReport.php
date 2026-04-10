<?php

namespace Seed\Types;

enum TypesWeatherReport: string
{
    case Sunny = "SUNNY";
    case Cloudy = "CLOUDY";
    case Raining = "RAINING";
    case Snowing = "SNOWING";
}
