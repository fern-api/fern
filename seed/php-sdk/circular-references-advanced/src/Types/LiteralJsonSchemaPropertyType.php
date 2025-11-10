<?php

namespace Seed\Types;

enum LiteralJsonSchemaPropertyType: string
{
    case String = "string";
    case Number = "number";
    case Boolean = "boolean";
}
