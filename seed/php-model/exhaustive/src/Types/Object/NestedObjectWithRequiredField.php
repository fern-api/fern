<?php

namespace Seed\Types\Object;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedObjectWithRequiredField extends JsonSerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
    public string $string;

    /**
     * @var ObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public ObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string: string,
     *   nestedObject: ObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->string = $values['string'];$this->nestedObject = $values['nestedObject'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
