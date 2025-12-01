<?php

namespace Seed\NullableOptional;

enum UserStatus
 : string {
    case Active = "active";
    case Inactive = "inactive";
    case Suspended = "suspended";
    case Deleted = "deleted";
}
