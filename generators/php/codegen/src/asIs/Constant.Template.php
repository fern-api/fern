<?php

namespace <%= namespace%>;

use DateTimeInterface;

class Constant
{
    public const DateFormat = 'Y-m-d';
    public const DeserializationDateFormat = "!" . self::DateFormat;
    public const DateTimeFormat = DateTimeInterface::RFC3339;
}