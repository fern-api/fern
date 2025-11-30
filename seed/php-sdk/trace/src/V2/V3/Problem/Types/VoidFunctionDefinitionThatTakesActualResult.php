<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * The generated signature will include an additional param, actualResult
 */
class VoidFunctionDefinitionThatTakesActualResult extends JsonSerializableType
{
    /**
     * @var array<Parameter> $additionalParameters
     */
    #[JsonProperty('additionalParameters'), ArrayType([Parameter::class])]
    public array $additionalParameters;

    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   additionalParameters: array<Parameter>,
     *   code: FunctionImplementationForMultipleLanguages,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->additionalParameters = $values['additionalParameters'];$this->code = $values['code'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
