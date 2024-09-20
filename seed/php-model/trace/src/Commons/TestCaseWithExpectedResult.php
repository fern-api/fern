<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseWithExpectedResult extends SerializableType
{
    /**
     * @var TestCase $testCase
     */
    #[JsonProperty('testCase')]
    public TestCase $testCase;

    /**
     * @var mixed $expectedResult
     */
    #[JsonProperty('expectedResult')]
    public mixed $expectedResult;

    /**
     * @param array{
     *   testCase: TestCase,
     *   expectedResult: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCase = $values['testCase'];
        $this->expectedResult = $values['expectedResult'];
    }
}
