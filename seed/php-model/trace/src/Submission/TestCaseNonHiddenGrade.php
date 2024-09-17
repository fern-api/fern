<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseNonHiddenGrade extends SerializableType
{
    #[JsonProperty("passed")]
    /**
     * @var bool $passed
     */
    public bool $passed;

    #[JsonProperty("stdout")]
    /**
     * @var string $stdout
     */
    public string $stdout;

    #[JsonProperty("actualResult")]
    /**
     * @var mixed $actualResult
     */
    public mixed $actualResult;

    #[JsonProperty("exception")]
    /**
     * @var mixed $exception
     */
    public mixed $exception;

    /**
     * @param bool $passed
     * @param string $stdout
     * @param mixed $actualResult
     * @param mixed $exception
     */
    public function __construct(
        bool $passed,
        string $stdout,
        mixed $actualResult,
        mixed $exception,
    ) {
        $this->passed = $passed;
        $this->stdout = $stdout;
        $this->actualResult = $actualResult;
        $this->exception = $exception;
    }
}
