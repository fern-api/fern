<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NonVoidFunctionDefinition extends SerializableType
{
    /**
     * @var NonVoidFunctionSignature $signature
     */
    #[JsonProperty("signature")]
    public NonVoidFunctionSignature $signature;

    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty("code")]
    public FunctionImplementationForMultipleLanguages $code;

    /**
     * @param NonVoidFunctionSignature $signature
     * @param FunctionImplementationForMultipleLanguages $code
     */
    public function __construct(
        NonVoidFunctionSignature $signature,
        FunctionImplementationForMultipleLanguages $code,
    ) {
        $this->signature = $signature;
        $this->code = $code;
    }
}
