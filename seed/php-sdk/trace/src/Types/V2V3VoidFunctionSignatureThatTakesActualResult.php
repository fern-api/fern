<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class V2V3VoidFunctionSignatureThatTakesActualResult extends JsonSerializableType
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;

    /**
     * @var (
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
     * ) $actualResultType
     */
    #[JsonProperty('actualResultType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $actualResultType;

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
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->parameters = $values['parameters'];
        $this->actualResultType = $values['actualResultType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
