<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class VoidFunctionDefinition extends SerializableType
{
    /**
     * @var array<Parameter> $parameters
     */
    #[JsonProperty("parameters"), ArrayType([Parameter::class])]
    public array $parameters;

    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty("code")]
    public FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array<Parameter> $parameters
     * @param FunctionImplementationForMultipleLanguages $code
     */
    public function __construct(
        array $parameters,
        FunctionImplementationForMultipleLanguages $code,
    ) {
        $this->parameters = $parameters;
        $this->code = $code;
    }
}
