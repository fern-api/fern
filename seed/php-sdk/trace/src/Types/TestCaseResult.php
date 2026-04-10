<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TestCaseResult extends JsonSerializableType
{
    /**
     * @var (
     *    VariableValueZero
     *   |VariableValueOne
     *   |VariableValueTwo
     *   |VariableValueThree
     *   |VariableValueFour
     *   |VariableValueFive
     *   |VariableValueSix
     *   |VariableValueSeven
     *   |VariableValueEight
     *   |VariableValueNine
     *   |VariableValueType
     * ) $expectedResult
     */
    #[JsonProperty('expectedResult'), Union(VariableValueZero::class, VariableValueOne::class, VariableValueTwo::class, VariableValueThree::class, VariableValueFour::class, VariableValueFive::class, VariableValueSix::class, VariableValueSeven::class, VariableValueEight::class, VariableValueNine::class, VariableValueType::class)]
    public VariableValueZero|VariableValueOne|VariableValueTwo|VariableValueThree|VariableValueFour|VariableValueFive|VariableValueSix|VariableValueSeven|VariableValueEight|VariableValueNine|VariableValueType $expectedResult;

    /**
     * @var (
     *    ActualResultZero
     *   |ActualResultOne
     *   |ActualResultTwo
     * ) $actualResult
     */
    #[JsonProperty('actualResult'), Union(ActualResultZero::class, ActualResultOne::class, ActualResultTwo::class)]
    public ActualResultZero|ActualResultOne|ActualResultTwo $actualResult;

    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @param array{
     *   expectedResult: (
     *    VariableValueZero
     *   |VariableValueOne
     *   |VariableValueTwo
     *   |VariableValueThree
     *   |VariableValueFour
     *   |VariableValueFive
     *   |VariableValueSix
     *   |VariableValueSeven
     *   |VariableValueEight
     *   |VariableValueNine
     *   |VariableValueType
     * ),
     *   actualResult: (
     *    ActualResultZero
     *   |ActualResultOne
     *   |ActualResultTwo
     * ),
     *   passed: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedResult = $values['expectedResult'];
        $this->actualResult = $values['actualResult'];
        $this->passed = $values['passed'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
