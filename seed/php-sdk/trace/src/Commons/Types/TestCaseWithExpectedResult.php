<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\TestCase;

class TestCaseWithExpectedResult extends SerializableType
{
    #[JsonProperty("testCase")]
    /**
     * @var TestCase $testCase
     */
    public TestCase $testCase;

    #[JsonProperty("expectedResult")]
    /**
     * @var mixed $expectedResult
     */
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
