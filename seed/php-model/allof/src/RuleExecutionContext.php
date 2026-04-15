<?php

namespace Seed;

enum RuleExecutionContext: string
{
    case Prod = "prod";
    case Staging = "staging";
    case Dev = "dev";
}
