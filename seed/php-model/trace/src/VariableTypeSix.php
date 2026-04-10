<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\MapType;
use Seed\Core\Json\JsonProperty;

class VariableTypeSix extends JsonSerializableType
{
    use MapType;

    /**
     * @var value-of<VariableTypeSixType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   keyType: (
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
     *   valueType: (
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
     *   type: value-of<VariableTypeSixType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->keyType = $values['keyType'];
        $this->valueType = $values['valueType'];
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
