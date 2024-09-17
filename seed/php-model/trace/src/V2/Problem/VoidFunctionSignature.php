<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\Problem\Parameter;

class VoidFunctionSignature extends SerializableType
{
    #[JsonProperty("parameters"), ArrayType([Parameter])]
    /**
     * @var array<Parameter> $parameters
     */
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
