<?php

namespace Seed\Core\Types;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Discriminant
{
    /**
     * @var array<string, string> types
     */
    public readonly array $types;

    public function __construct($types)
    {
        $this->types = $types;
    }
}
