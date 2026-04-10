<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2GetFunctionSignatureRequest extends JsonSerializableType
{
    /**
     * @var (
     *    V2FunctionSignatureZero
     *   |V2FunctionSignatureOne
     *   |V2FunctionSignatureTwo
     * ) $functionSignature
     */
    #[JsonProperty('functionSignature'), Union(V2FunctionSignatureZero::class, V2FunctionSignatureOne::class, V2FunctionSignatureTwo::class)]
    public V2FunctionSignatureZero|V2FunctionSignatureOne|V2FunctionSignatureTwo $functionSignature;

    /**
     * @param array{
     *   functionSignature: (
     *    V2FunctionSignatureZero
     *   |V2FunctionSignatureOne
     *   |V2FunctionSignatureTwo
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
