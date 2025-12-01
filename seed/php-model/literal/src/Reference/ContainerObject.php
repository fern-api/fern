<?php

namespace Seed\Reference;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ContainerObject extends JsonSerializableType
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
    )
    {
        $this->nestedObjects = $values['nestedObjects'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
