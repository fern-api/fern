<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TypesNestedObjectWithRequiredField extends JsonSerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
    public string $string;

    /**
     * @var TypesObjectWithOptionalField $nestedObject
     */
    #[JsonProperty('NestedObject')]
    public TypesObjectWithOptionalField $nestedObject;

    /**
     * @param array{
     *   string: string,
     *   nestedObject: TypesObjectWithOptionalField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->string = $values['string'];
        $this->nestedObject = $values['nestedObject'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
