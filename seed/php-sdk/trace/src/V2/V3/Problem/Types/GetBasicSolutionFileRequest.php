<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetBasicSolutionFileRequest extends SerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty("methodName")]
    public string $methodName;

    /**
     * @var NonVoidFunctionSignature $signature
     */
    #[JsonProperty("signature")]
    public NonVoidFunctionSignature $signature;

    /**
     * @param string $methodName
     * @param NonVoidFunctionSignature $signature
     */
    public function __construct(
        string $methodName,
        NonVoidFunctionSignature $signature,
    ) {
        $this->methodName = $methodName;
        $this->signature = $signature;
    }
}
