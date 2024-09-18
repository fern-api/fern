<?php

namespace Seed\Types\Object\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Object\Types\ObjectWithOptionalField;

class NestedObjectWithOptionalField extends SerializableType
{
    #[JsonProperty("string")]
    /**
     * @var ?string $string
     */
    public ?string $string;

    #[JsonProperty("NestedObject")]
    /**
     * @var ?ObjectWithOptionalField $nestedObject
     */
    public ?ObjectWithOptionalField $nestedObject;

    /**
     * @param ?string $string
     * @param ?ObjectWithOptionalField $nestedObject
     */
    public function __construct(
        ?string $string = null,
        ?ObjectWithOptionalField $nestedObject = null,
    ) {
        $this->string = $string;
        $this->nestedObject = $nestedObject;
    }
}
