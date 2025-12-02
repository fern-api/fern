<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NonVoidFunctionDefinition extends JsonSerializableType
{
    /**
     * @var NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public NonVoidFunctionSignature $signature;

    /**
     * @var FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   signature: NonVoidFunctionSignature,
     *   code: FunctionImplementationForMultipleLanguages,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->signature = $values['signature'];$this->code = $values['code'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
