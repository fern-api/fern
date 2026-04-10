<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ListType;
use Seed\Core\Json\JsonProperty;

class VariableTypeFive extends JsonSerializableType
{
    use ListType;

    /**
     * @var value-of<VariableTypeFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
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
     *   type: value-of<VariableTypeFiveType>,
     *   isFixedLength?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->valueType = $values['valueType'];
        $this->isFixedLength = $values['isFixedLength'] ?? null;
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
