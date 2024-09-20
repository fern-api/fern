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
     * @param array{
     *   methodName: string,
     *   signature: NonVoidFunctionSignature,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->methodName = $values['methodName'];
        $this->signature = $values['signature'];
    }
}
