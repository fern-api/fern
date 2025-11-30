<?php

namespace Seed\Complex\Types;

enum SingleFilterSearchRequestOperator
 : string {
    case Equals = "=";
    case NotEquals = "!=";
    case In = "IN";
    case NotIn = "NIN";
    case LessThan = "<";
    case GreaterThan = ">";
    case Contains = "~";
    case DoesNotContain = "!~";
    case StartsWith = "^";
    case EndsWith = "\$";
}
