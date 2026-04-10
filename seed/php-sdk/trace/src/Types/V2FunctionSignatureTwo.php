<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2VoidFunctionSignatureThatTakesActualResult;
use Seed\Core\Json\JsonProperty;

class V2FunctionSignatureTwo extends JsonSerializableType
{
    use V2VoidFunctionSignatureThatTakesActualResult;

    /**
     * @var value-of<V2FunctionSignatureTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2Parameter>,
     *   actualResultType: (
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
     *   type: value-of<V2FunctionSignatureTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->actualResultType = $values['actualResultType'];
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
