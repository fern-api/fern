<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseResult extends SerializableType
{
    #[JsonProperty("expectedResult")]
    /**
     * @var mixed $expectedResult
     */
    public mixed $expectedResult;

    #[JsonProperty("actualResult")]
    /**
     * @var mixed $actualResult
     */
    public mixed $actualResult;

    #[JsonProperty("passed")]
    /**
     * @var bool $passed
     */
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
