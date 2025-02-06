<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class NonVoidFunctionSignature extends JsonSerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var mixed $returnType
     */
    #[JsonProperty('returnType')]
    public mixed $returnType;

    /**
     * @param array{
     *   parameters: array<Parameter>,
     *   returnType: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->returnType = $values['returnType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
