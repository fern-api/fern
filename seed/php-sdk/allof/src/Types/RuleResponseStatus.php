<?php

namespace Seed\Types;

enum RuleResponseStatus: string
{
    case Active = "active";
    case Inactive = "inactive";
    case Draft = "draft";
}
