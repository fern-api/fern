<?php

namespace Seed\Types;

enum PlantPostSunExposure: string
{
    case Full = "full";
    case Partial = "partial";
    case Shade = "shade";
}
