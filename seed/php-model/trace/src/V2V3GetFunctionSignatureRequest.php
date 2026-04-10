<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2V3GetFunctionSignatureRequest extends JsonSerializableType
{
    /**
     * @var (
     *    V2V3FunctionSignatureZero
     *   |V2V3FunctionSignatureOne
     *   |V2V3FunctionSignatureTwo
     * ) $functionSignature
     */
    #[JsonProperty('functionSignature'), Union(V2V3FunctionSignatureZero::class, V2V3FunctionSignatureOne::class, V2V3FunctionSignatureTwo::class)]
    public V2V3FunctionSignatureZero|V2V3FunctionSignatureOne|V2V3FunctionSignatureTwo $functionSignature;

    /**
     * @param array{
     *   functionSignature: (
     *    V2V3FunctionSignatureZero
     *   |V2V3FunctionSignatureOne
     *   |V2V3FunctionSignatureTwo
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->functionSignature = $values['functionSignature'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
