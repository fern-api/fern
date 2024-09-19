<?php

namespace Seed\Types\Object\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NestedObjectWithOptionalField extends SerializableType
{
    /**
     * @var ?string $string
     */
    #[JsonProperty("string")]
    public ?string $string;

    /**
     * @var ?ObjectWithOptionalField $nestedObject
     */
    #[JsonProperty("NestedObject")]
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
