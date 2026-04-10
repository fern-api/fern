<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class DebugVariableValueSix extends JsonSerializableType
{
    /**
     * @var value-of<DebugVariableValueSixType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?array<(
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * )> $value
     */
    #[JsonProperty('value'), ArrayType([new Union(DebugVariableValueZero::class, DebugVariableValueOne::class, DebugVariableValueTwo::class, DebugVariableValueThree::class, DebugVariableValueFour::class, DebugVariableValueFive::class, DebugVariableValueSix::class, DebugVariableValueSeven::class, DebugVariableValueEight::class, DebugVariableValueNine::class, DebugVariableValueTen::class, DebugVariableValueEleven::class, DebugVariableValueTwelve::class)])]
    public ?array $value;

    /**
     * @param array{
     *   type: value-of<DebugVariableValueSixType>,
     *   value?: ?array<(
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * )>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
