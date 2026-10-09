<?php

namespace Seed\Types;

enum PlantBaseWateringFrequency: string
{
    case Daily = "daily";
    case Weekly = "weekly";
    case Biweekly = "biweekly";
    case Monthly = "monthly";
}
