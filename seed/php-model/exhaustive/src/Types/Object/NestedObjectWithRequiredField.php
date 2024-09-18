<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Object\ObjectWithOptionalField;

class NestedObjectWithRequiredField extends SerializableType
{
    #[JsonProperty("string")]
    /**
     * @var string $string
     */
    public string $string;

    #[JsonProperty("NestedObject")]
    /**
     * @var ObjectWithOptionalField $nestedObject
     */
    public ObjectWithOptionalField $nestedObject;

    /**
     * @param string $string
     * @param ObjectWithOptionalField $nestedObject
     */
    public function __construct(
        string $string,
        ObjectWithOptionalField $nestedObject,
    ) {
        $this->string = $string;
        $this->nestedObject = $nestedObject;
    }
}
