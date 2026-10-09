<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class AstllmNodeWithSchema extends JsonSerializableType
{
    /**
     * @var value-of<AstllmNodeWithSchemaType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $model
     */
    #[JsonProperty('model')]
    public string $model;

    /**
     * @var array<string, mixed> $valueSchema
     */
    #[JsonProperty('value_schema'), ArrayType(['string' => 'mixed'])]
    public array $valueSchema;

    /**
     * @param array{
     *   type: value-of<AstllmNodeWithSchemaType>,
     *   model: string,
     *   valueSchema: array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->model = $values['model'];
        $this->valueSchema = $values['valueSchema'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
