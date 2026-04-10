<?php

namespace Seed;

enum RuleResponseStatus: string
{
    case Active = "active";
    case Inactive = "inactive";
    case Draft = "draft";
}
