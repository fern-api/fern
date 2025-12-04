<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\DebugVariableValue;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Scope extends JsonSerializableType
{
    /**
     * @var array<string, DebugVariableValue> $variables
     */
    #[JsonProperty('variables'), ArrayType(['string' => DebugVariableValue::class])]
    public array $variables;

    /**
     * @param array{
     *   variables: array<string, DebugVariableValue>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->variables = $values['variables'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
