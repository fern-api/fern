<?php

namespace Seed\Core\Types;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Discriminant
{
    /**
     * @param array<string, string> $types
     */
    public function __construct(public readonly array $types) {}
}
