<?php

namespace Seed\Core\Types;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Discriminant
{
    /**
     * @param array<string, mixed> $types
     */
    public function __construct(public readonly array $types) {}
}
