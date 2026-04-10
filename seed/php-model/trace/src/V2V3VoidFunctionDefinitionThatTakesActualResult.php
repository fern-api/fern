<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * The generated signature will include an additional param, actualResult
 */
class V2V3VoidFunctionDefinitionThatTakesActualResult extends JsonSerializableType
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

    /**
     * @param array{
     *   additionalParameters: array<V2V3Parameter>,
     *   code: V2V3FunctionImplementationForMultipleLanguages,
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
