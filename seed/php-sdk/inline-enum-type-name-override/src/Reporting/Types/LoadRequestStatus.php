<?php

namespace Seed\Reporting\Types;

enum LoadRequestStatus: string
{
    case Active = "active";
    case Inactive = "inactive";
    case Pending = "pending";
}
