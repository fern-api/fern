<?php

namespace Seed\Types;

enum Operand
 : string {
    case GreaterThan = ">";
    case EqualTo = "=";
    case LessThan = "less_than";
}
