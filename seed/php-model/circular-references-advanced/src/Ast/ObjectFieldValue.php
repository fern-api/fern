<?php

namespace Seed\Ast;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

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
     * @var FieldValue $value
     */
    #[JsonProperty('value')]
    public FieldValue $value;

    /**
     * @param array{
     *   name: string,
     *   value: FieldValue,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
