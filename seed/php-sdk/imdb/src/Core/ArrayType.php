<?php

namespace Seed\Core;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class ArrayType
{
    /**
     * @param array $type Array in the form ['keyType' => 'valueType'] for maps, or ['valueType'] for lists
     */
    public function __construct(public array $type) {}
}

class Union {
    /**
     * @var string[]
     */
    public array $types;
    public function __construct(string ...$strings) {
        $this->types = $strings;
    }

    /**
     * Check if a given type is part of the union.
     *
     * @param mixed $type
     * @return bool
     */
    public function contains($type): bool
    {
        return in_array($type, $this->types, true);
    }
}