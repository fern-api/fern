<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3VoidFunctionSignature extends JsonSerializableType
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
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
