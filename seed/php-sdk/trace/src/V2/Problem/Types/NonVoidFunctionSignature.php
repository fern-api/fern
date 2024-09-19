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
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var mixed $returnType
     */
    #[JsonProperty("returnType")]
    public mixed $returnType;

    /**
     * @param array<Parameter> $parameters
     * @param mixed $returnType
     */
    public function __construct(
        array $parameters,
        mixed $returnType,
    ) {
        $this->parameters = $parameters;
        $this->returnType = $returnType;
    }
}
