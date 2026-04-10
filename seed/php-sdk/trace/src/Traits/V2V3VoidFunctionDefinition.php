<?php

namespace Seed\Traits;

use Seed\Types\V2V3Parameter;
use Seed\Types\V2V3FunctionImplementationForMultipleLanguages;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<V2V3Parameter> $parameters
 * @property V2V3FunctionImplementationForMultipleLanguages $code
 */
trait V2V3VoidFunctionDefinition
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;

    /**
     * @var V2V3FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2V3FunctionImplementationForMultipleLanguages $code;
}
