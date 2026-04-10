<?php

namespace Seed\Traits;

use Seed\V2Parameter;
use Seed\V2FunctionImplementationForMultipleLanguages;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<V2Parameter> $parameters
 * @property V2FunctionImplementationForMultipleLanguages $code
 */
trait V2VoidFunctionDefinition
{
    /**
     * @var array<V2Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2Parameter::class])]
    public array $parameters;

    /**
     * @var V2FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2FunctionImplementationForMultipleLanguages $code;
}
