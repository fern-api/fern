<?php

namespace Seed\Service\Types;

enum ResourceStatus
 : string {
    case Active = "ACTIVE";
    case Inactive = "INACTIVE";
}
