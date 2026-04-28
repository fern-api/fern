<?php

namespace Seed\Types;

enum UpdateVendorRequestStatus: string
{
    case Active = "ACTIVE";
    case Inactive = "INACTIVE";
}
