<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * This type allows us to test a circular reference with a union type (see FieldValue).
 */
class ObjectFieldValue extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var (
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * ) $value
     */
    #[JsonProperty('value'), Union(FieldValueZero::class, FieldValueOne::class, FieldValueTwo::class)]
    public FieldValueZero|FieldValueOne|FieldValueTwo $value;

    /**
     * @param array{
     *   name: string,
     *   value: (
     *    FieldValueZero
     *   |FieldValueOne
     *   |FieldValueTwo
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
