<?php

namespace Seed\Types;

enum InlineEnum: string
{
    case Sunny = "SUNNY";
    case Cloudy = "CLOUDY";
    case Raining = "RAINING";
    case Snowing = "SNOWING";
}
