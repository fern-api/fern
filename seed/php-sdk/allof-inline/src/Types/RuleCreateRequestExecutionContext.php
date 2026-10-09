<?php

namespace Seed\Types;

enum RuleCreateRequestExecutionContext: string
{
    case Prod = "prod";
    case Staging = "staging";
    case Dev = "dev";
}
