<?php

namespace Seed\Traits;

use Seed\Types\V2V3Parameter;
use Seed\Types\V2V3FunctionImplementationForMultipleLanguages;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * The generated signature will include an additional param, actualResult
 *
 * @property array<V2V3Parameter> $additionalParameters
 * @property V2V3FunctionImplementationForMultipleLanguages $code
 */
trait V2V3VoidFunctionDefinitionThatTakesActualResult
{
    /**
     * @var array<V2V3Parameter> $additionalParameters
     */
    #[JsonProperty('additionalParameters'), ArrayType([V2V3Parameter::class])]
    public array $additionalParameters;

    /**
     * @var V2V3FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2V3FunctionImplementationForMultipleLanguages $code;
}
