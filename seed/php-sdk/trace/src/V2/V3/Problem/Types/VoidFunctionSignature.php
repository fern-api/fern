<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class VoidFunctionSignature extends SerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @param array<Parameter> $parameters
     */
    public function __construct(
        array $parameters,
    ) {
        $this->parameters = $parameters;
    }
}
