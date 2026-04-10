<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class Scope extends JsonSerializableType
{
    /**
     * @var array<string, (
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
     * )> $variables
     */
    #[JsonProperty('variables'), ArrayType(['string' => new Union(DebugVariableValueZero::class, DebugVariableValueOne::class, DebugVariableValueTwo::class, DebugVariableValueThree::class, DebugVariableValueFour::class, DebugVariableValueFive::class, DebugVariableValueSix::class, DebugVariableValueSeven::class, DebugVariableValueEight::class, DebugVariableValueNine::class, DebugVariableValueTen::class, DebugVariableValueEleven::class, DebugVariableValueTwelve::class)])]
    public array $variables;

    /**
     * @param array{
     *   variables: array<string, (
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
        $this->variables = $values['variables'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
