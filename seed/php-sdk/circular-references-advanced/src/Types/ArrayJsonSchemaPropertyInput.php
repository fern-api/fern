<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class ArrayJsonSchemaPropertyInput extends JsonSerializableType
{
    /**
     * @var ?'array' $type
     */
    #[JsonProperty('type')]
    public ?string $type;

    /**
     * @var ?string $description
     */
    #[JsonProperty('description')]
    public ?string $description;

    /**
     * @var (
     *    LiteralJsonSchemaProperty
     *   |ObjectJsonSchemaPropertyInput
     *   |ArrayJsonSchemaPropertyInput
     * ) $items
     */
    #[JsonProperty('items'), Union(LiteralJsonSchemaProperty::class, ObjectJsonSchemaPropertyInput::class, ArrayJsonSchemaPropertyInput::class)]
    public LiteralJsonSchemaProperty|ObjectJsonSchemaPropertyInput|ArrayJsonSchemaPropertyInput $items;

    /**
     * @param array{
     *   items: (
     *    LiteralJsonSchemaProperty
     *   |ObjectJsonSchemaPropertyInput
     *   |ArrayJsonSchemaPropertyInput
     * ),
     *   type?: ?'array',
     *   description?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->description = $values['description'] ?? null;
        $this->items = $values['items'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
