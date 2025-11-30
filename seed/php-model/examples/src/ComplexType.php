<?php

namespace Seed;

enum ComplexType
 : string {
    case Object = "object";
    case Union = "union";
    case Unknown = "unknown";
}
