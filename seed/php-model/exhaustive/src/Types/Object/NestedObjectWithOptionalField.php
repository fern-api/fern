<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NestedObjectWithOptionalField extends SerializableType
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
        array $values,
    ) {
        $this->string = $values['string'] ?? null;
        $this->nestedObject = $values['nestedObject'] ?? null;
    }
}
