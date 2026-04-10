<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2V3NonVoidFunctionDefinition extends JsonSerializableType
{
    /**
     * @var V2V3NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public V2V3NonVoidFunctionSignature $signature;

    /**
     * @var V2V3FunctionImplementationForMultipleLanguages $code
     */
    #[JsonProperty('code')]
    public V2V3FunctionImplementationForMultipleLanguages $code;

    /**
     * @param array{
     *   signature: V2V3NonVoidFunctionSignature,
     *   code: V2V3FunctionImplementationForMultipleLanguages,
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
