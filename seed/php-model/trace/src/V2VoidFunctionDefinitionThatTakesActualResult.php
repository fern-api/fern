<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * The generated signature will include an additional param, actualResult
 */
class V2VoidFunctionDefinitionThatTakesActualResult extends JsonSerializableType
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

    /**
     * @param array{
     *   additionalParameters: array<V2Parameter>,
     *   code: V2FunctionImplementationForMultipleLanguages,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->additionalParameters = $values['additionalParameters'];
        $this->code = $values['code'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
