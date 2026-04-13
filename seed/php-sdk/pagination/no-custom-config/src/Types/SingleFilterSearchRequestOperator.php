<?php

namespace Seed\Types;

enum SingleFilterSearchRequestOperator: string
{
    case EqualTo = "=";
    case NotEquals = "!=";
    case In = "IN";
    case Nin = "NIN";
    case LessThan = "<";
    case GreaterThan = ">";
    case Tilde = "~";
    case NotTilde = "!~";
    case Caret = "^";
    case Dollar = "\$";
}
