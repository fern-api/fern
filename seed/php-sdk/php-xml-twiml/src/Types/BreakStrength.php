<?php

namespace Seed\Types;

enum BreakStrength: string
{
    case None = "none";
    case XWeak = "x-weak";
    case Weak = "weak";
    case Medium = "medium";
    case Strong = "strong";
    case XStrong = "x-strong";
}
