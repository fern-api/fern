<?php

namespace Seed\Reference\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ContainerObject extends SerializableType
{
    /**
     * @var array<NestedObjectWithLiterals> $nestedObjects
     */
    #[JsonProperty('nestedObjects'), ArrayType([NestedObjectWithLiterals::class])]
    public array $nestedObjects;

    /**
     * @param array{
     *   nestedObjects: array<NestedObjectWithLiterals>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nestedObjects = $values['nestedObjects'];
    }
}
