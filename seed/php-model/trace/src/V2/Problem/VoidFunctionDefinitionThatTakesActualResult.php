<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\V2\Problem\Parameter;
use Seed\V2\Problem\FunctionImplementationForMultipleLanguages;

/**
* The generated signature will include an additional param, actualResult
 */
class VoidFunctionDefinitionThatTakesActualResult extends SerializableType
{
    #[JsonProperty("additionalParameters"), ArrayType([Parameter])]
    /**
     * @var array<Parameter> $additionalParameters
     */
    public array $additionalParameters;

    #[JsonProperty("code")]
    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
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
