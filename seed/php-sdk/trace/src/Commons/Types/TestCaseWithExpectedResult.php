<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseWithExpectedResult extends SerializableType
{
    /**
     * @var TestCase $testCase
     */
    #[JsonProperty("testCase")]
    public TestCase $testCase;

    /**
     * @var mixed $expectedResult
     */
    #[JsonProperty("expectedResult")]
    public mixed $expectedResult;

    /**
     * @param TestCase $testCase
     * @param mixed $expectedResult
     */
    public function __construct(
        TestCase $testCase,
        mixed $expectedResult,
    ) {
        $this->testCase = $testCase;
        $this->expectedResult = $expectedResult;
    }
}
