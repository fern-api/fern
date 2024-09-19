<?php

namespace Seed\InlinedRequests\Requests;

use Seed\Core\JsonProperty;
use Seed\Types\Object\Types\ObjectWithOptionalField;

class PostWithObjectBody
{
    /**
     * @var string $string
     */
    #[JsonProperty("string")]
    public string $string;

    /**
     * @var int $integer
     */
    #[JsonProperty("integer")]
    public int $integer;

    /**
     * @var ObjectWithOptionalField $nestedObject
     */
    #[JsonProperty("NestedObject")]
    public ObjectWithOptionalField $nestedObject;

    /**
     * @param string $string
     * @param int $integer
     * @param ObjectWithOptionalField $nestedObject
     */
    public function __construct(
        string $string,
        int $integer,
        ObjectWithOptionalField $nestedObject,
    ) {
        $this->string = $string;
        $this->integer = $integer;
        $this->nestedObject = $nestedObject;
    }
}
