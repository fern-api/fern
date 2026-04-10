<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3VoidFunctionSignatureThatTakesActualResult;
use Seed\Core\Json\JsonProperty;

class V2V3FunctionSignatureTwo extends JsonSerializableType
{
    use V2V3VoidFunctionSignatureThatTakesActualResult;

    /**
     * @var value-of<V2V3FunctionSignatureTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   parameters: array<V2V3Parameter>,
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
     *   type: value-of<V2V3FunctionSignatureTwoType>,
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
