<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\NonVoidFunctionSignature;
use Seed\V2\V3\Problem\Types\FunctionImplementationForMultipleLanguages;

class NonVoidFunctionDefinition extends SerializableType
{
    #[JsonProperty("signature")]
    /**
     * @var NonVoidFunctionSignature $signature
     */
    public NonVoidFunctionSignature $signature;

    #[JsonProperty("code")]
    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
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
