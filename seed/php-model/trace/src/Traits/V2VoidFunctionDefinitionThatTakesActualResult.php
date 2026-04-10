<?php

namespace Seed\Traits;

use Seed\V2Parameter;
use Seed\V2FunctionImplementationForMultipleLanguages;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * The generated signature will include an additional param, actualResult
 *
 * @property array<V2Parameter> $additionalParameters
 * @property V2FunctionImplementationForMultipleLanguages $code
 */
trait V2VoidFunctionDefinitionThatTakesActualResult
{
    /**
     * @var array<V2Parameter> $additionalParameters
     */
    #[JsonProperty('additionalParameters'), ArrayType([V2Parameter::class])]
    public array $additionalParameters;

    /**
     * @var V2FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2FunctionImplementationForMultipleLanguages $code;
}
