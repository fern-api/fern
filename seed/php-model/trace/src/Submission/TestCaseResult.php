<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseResult extends SerializableType
{
    /**
     * @var mixed $expectedResult
     */
    #[JsonProperty("expectedResult")]
    public mixed $expectedResult;

    /**
     * @var mixed $actualResult
     */
    #[JsonProperty("actualResult")]
    public mixed $actualResult;

    /**
     * @var bool $passed
     */
    #[JsonProperty("passed")]
    public bool $passed;

    /**
     * @param mixed $expectedResult
     * @param mixed $actualResult
     * @param bool $passed
     */
    public function __construct(
        mixed $expectedResult,
        mixed $actualResult,
        bool $passed,
    ) {
        $this->expectedResult = $expectedResult;
        $this->actualResult = $actualResult;
        $this->passed = $passed;
    }
}
