<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class NonVoidFunctionSignature extends SerializableType
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
}
