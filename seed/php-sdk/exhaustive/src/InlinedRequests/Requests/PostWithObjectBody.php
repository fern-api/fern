<?php

namespace Seed\InlinedRequests\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Object\Types\ObjectWithOptionalField;

class PostWithObjectBody extends SerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
    public string $string;

    /**
     * @var int $integer
     */
    #[JsonProperty('integer')]
    public int $integer;

    /**
     * @var ObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public ObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string: string,
     *   integer: int,
     *   nestedObject: ObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->string = $values['string'];
        $this->integer = $values['integer'];
        $this->nestedObject = $values['nestedObject'];
    }
}
