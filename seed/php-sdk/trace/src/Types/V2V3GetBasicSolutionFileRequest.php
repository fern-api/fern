<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2V3GetBasicSolutionFileRequest extends JsonSerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @var V2V3NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public V2V3NonVoidFunctionSignature $signature;

    /**
     * @param array{
     *   methodName: string,
     *   signature: V2V3NonVoidFunctionSignature,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->methodName = $values['methodName'];
        $this->signature = $values['signature'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
