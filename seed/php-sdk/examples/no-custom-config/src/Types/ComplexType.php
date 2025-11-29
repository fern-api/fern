<?php

namespace Seed\Types;

enum ComplexType
 : string {
    case Object = "object";
    case Union = "union";
    case Unknown = "unknown";
}
