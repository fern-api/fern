<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2VoidFunctionSignature extends JsonSerializableType
{
    /**
     * @var array<V2Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2Parameter::class])]
    public array $parameters;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
