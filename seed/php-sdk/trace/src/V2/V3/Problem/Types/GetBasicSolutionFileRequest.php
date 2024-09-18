<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\NonVoidFunctionSignature;

class GetBasicSolutionFileRequest extends SerializableType
{
    #[JsonProperty("methodName")]
    /**
     * @var string $methodName
     */
    public string $methodName;

    #[JsonProperty("signature")]
    /**
     * @var NonVoidFunctionSignature $signature
     */
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
