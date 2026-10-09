<?php

namespace Seed\Types;

enum PlantPostWateringFrequency: string
{
    case Daily = "daily";
    case Weekly = "weekly";
    case Biweekly = "biweekly";
    case Monthly = "monthly";
}
