<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\V3\Problem\Parameter;

class NonVoidFunctionSignature extends SerializableType
{
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    /**
     * @var array<Parameter> $parameters
     */
    public array $parameters;

    #[JsonProperty("returnType")]
    /**
     * @var mixed $returnType
     */
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
