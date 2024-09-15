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
}