<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Scope extends JsonSerializableType
{
    /**
     * @var array<string, mixed> $variables
     */
    #[JsonProperty('variables'), ArrayType(['string' => 'mixed'])]
    public array $variables;

    /**
     * @param array{
     *   variables: array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->variables = $values['variables'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
