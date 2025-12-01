<?php

namespace Custom\Package\Path\Core\Types;

use DateTimeInterface;

class Constant
{
    public const DateFormat = 'Y-m-d';
    public const DateDeserializationFormat = "!" . self::DateFormat;
    public const DateTimeFormat = DateTimeInterface::RFC3339;
}