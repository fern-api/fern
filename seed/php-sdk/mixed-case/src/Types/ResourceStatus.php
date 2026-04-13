<?php

namespace Seed\Types;

enum ResourceStatus: string
{
    case Active = "ACTIVE";
    case Inactive = "INACTIVE";
}
