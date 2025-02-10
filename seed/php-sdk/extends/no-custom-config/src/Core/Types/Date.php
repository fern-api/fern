<?php

namespace Seed\Core\Types;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Date
{
    public const TYPE_DATE = 'date';
    public const TYPE_DATETIME = 'datetime';

    public function __construct(public string $type)
    {
    }
}
