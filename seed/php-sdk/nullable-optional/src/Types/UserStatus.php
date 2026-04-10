<?php

namespace Seed\Types;

enum UserStatus: string
{
    case Active = "active";
    case Inactive = "inactive";
    case Suspended = "suspended";
    case Deleted = "deleted";
}
