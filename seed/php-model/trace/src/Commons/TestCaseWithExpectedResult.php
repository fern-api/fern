<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseWithExpectedResult extends JsonSerializableType
{
    /**
     * @var TestCase $testCase
     */
    #[JsonProperty('testCase')]
    public TestCase $testCase;

    /**
     * @var VariableValue $expectedResult
     */
    #[JsonProperty('expectedResult')]
    public VariableValue $expectedResult;

    /**
     * @param array{
     *   testCase: TestCase,
     *   expectedResult: VariableValue,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->testCase = $values['testCase'];$this->expectedResult = $values['expectedResult'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
