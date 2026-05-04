<?php

namespace Seed\Types;

enum RuleExecutionContext: string
{
    case Prod = "prod";
    case Staging = "staging";
    case Dev = "dev";
}
