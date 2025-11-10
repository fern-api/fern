<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class ObjectJsonSchemaPropertyInput extends JsonSerializableType
{
    /**
     * @var ?'object' $type
     */
    #[JsonProperty('type')]
    public ?string $type;

    /**
     * @var ?array<string> $required
     */
    #[JsonProperty('required'), ArrayType(['string'])]
    public ?array $required;

    /**
     * @var ?string $description
     */
    #[JsonProperty('description')]
    public ?string $description;

    /**
     * @var ?array<string, (
     *    LiteralJsonSchemaProperty
     *   |ObjectJsonSchemaPropertyInput
     *   |ArrayJsonSchemaPropertyInput
     * )> $properties
     */
    #[JsonProperty('properties'), ArrayType(['string' => new Union(LiteralJsonSchemaProperty::class, ObjectJsonSchemaPropertyInput::class, ArrayJsonSchemaPropertyInput::class)])]
    public ?array $properties;

    /**
     * @param array{
     *   type?: ?'object',
     *   required?: ?array<string>,
     *   description?: ?string,
     *   properties?: ?array<string, (
     *    LiteralJsonSchemaProperty
     *   |ObjectJsonSchemaPropertyInput
     *   |ArrayJsonSchemaPropertyInput
     * )>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->type = $values['type'] ?? null;
        $this->required = $values['required'] ?? null;
        $this->description = $values['description'] ?? null;
        $this->properties = $values['properties'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
