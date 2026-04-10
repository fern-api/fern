<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2NonVoidFunctionDefinition extends JsonSerializableType
{
    /**
     * @var V2NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public V2NonVoidFunctionSignature $signature;

    /**
     * @var V2FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   signature: V2NonVoidFunctionSignature,
     *   code: V2FunctionImplementationForMultipleLanguages,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->signature = $values['signature'];
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
