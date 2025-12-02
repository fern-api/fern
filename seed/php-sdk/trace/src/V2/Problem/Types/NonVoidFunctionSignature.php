<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Commons\Types\VariableType;

class NonVoidFunctionSignature extends JsonSerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var VariableType $returnType
     */
    #[JsonProperty('returnType')]
    public VariableType $returnType;

    /**
     * @param array{
     *   parameters: array<Parameter>,
     *   returnType: VariableType,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->parameters = $values['parameters'];$this->returnType = $values['returnType'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
