<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TestCaseWithExpectedResult extends JsonSerializableType
{
    /**
     * @var TestCase $testCase
     */
    #[JsonProperty('testCase')]
    public TestCase $testCase;

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
     * @param array{
     *   testCase: TestCase,
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
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCase = $values['testCase'];
        $this->expectedResult = $values['expectedResult'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
