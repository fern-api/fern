<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3NonVoidFunctionSignature;
use Seed\Core\Json\JsonProperty;

class V2V3FunctionSignatureOne extends JsonSerializableType
{
    use V2V3NonVoidFunctionSignature;

    /**
     * @var value-of<V2V3FunctionSignatureOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
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
     *   type: value-of<V2V3FunctionSignatureOneType>,
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
