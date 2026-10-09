<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class AstNodeLlm extends JsonSerializableType
{
    /**
     * @var string $model
     */
    #[JsonProperty('model')]
    public string $model;

    /**
     * @var ?array<string, mixed> $valueSchema
     */
    #[JsonProperty('value_schema'), ArrayType(['string' => 'mixed'])]
    public ?array $valueSchema;

    /**
     * @var ?string $prompt
     */
    #[JsonProperty('prompt')]
    public ?string $prompt;

    /**
     * @param array{
     *   model: string,
     *   valueSchema?: ?array<string, mixed>,
     *   prompt?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->model = $values['model'];
        $this->valueSchema = $values['valueSchema'] ?? null;
        $this->prompt = $values['prompt'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
