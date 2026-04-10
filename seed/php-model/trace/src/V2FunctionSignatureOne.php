<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2NonVoidFunctionSignature;
use Seed\Core\Json\JsonProperty;

class V2FunctionSignatureOne extends JsonSerializableType
{
    use V2NonVoidFunctionSignature;

    /**
     * @var value-of<V2FunctionSignatureOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     *   returnType: (
     *    VariableTypeZero
     *   |VariableTypeOne
     *   |VariableTypeTwo
     *   |VariableTypeThree
     *   |VariableTypeFour
     *   |VariableTypeFive
     *   |VariableTypeSix
     *   |VariableTypeSeven
     *   |VariableTypeEight
     *   |VariableTypeNine
     * ),
     *   type: value-of<V2FunctionSignatureOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->returnType = $values['returnType'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
