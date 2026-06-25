<?php

namespace Seed\Reporting\Types;

enum LoadRequestCache: string
{
    case StaleIfSlow = "stale-if-slow";
    case NoCache = "no-cache";
}
