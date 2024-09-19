<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

/**
* The generated signature will include an additional param, actualResult
 */
class VoidFunctionDefinitionThatTakesActualResult extends SerializableType
{
    /**
     * @var array<Parameter> $additionalParameters
     */
    #[JsonProperty("additionalParameters"), ArrayType([Parameter::class])]
    public array $additionalParameters;

    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty("code")]
    public FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array<Parameter> $additionalParameters
     * @param FunctionImplementationForMultipleLanguages $code
     */
    public function __construct(
        array $additionalParameters,
        FunctionImplementationForMultipleLanguages $code,
    ) {
        $this->additionalParameters = $additionalParameters;
        $this->code = $code;
    }
}
