<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedObjectWithOptionalField extends JsonSerializableType
{
    /**
     * @var ?string $string
     */
    #[JsonProperty('string')]
    public ?string $string;

    /**
     * @var ?ObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public ?ObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string?: ?string,
     *   nestedObject?: ?ObjectWithOptionalField,
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
