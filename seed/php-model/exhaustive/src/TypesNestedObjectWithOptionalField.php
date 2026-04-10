<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TypesNestedObjectWithOptionalField extends JsonSerializableType
{
    /**
     * @var ?string $string
     */
    #[JsonProperty('string')]
    public ?string $string;

    /**
     * @var ?TypesObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public ?TypesObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string?: ?string,
     *   nestedObject?: ?TypesObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->string = $values['string'] ?? null;
        $this->nestedObject = $values['nestedObject'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
