<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseNonHiddenGrade extends SerializableType
{
    /**
     * @var bool $passed
     */
    #[JsonProperty("passed")]
    public bool $passed;

    /**
     * @var mixed $actualResult
     */
    #[JsonProperty("actualResult")]
    public mixed $actualResult;

    /**
     * @var mixed $exception
     */
    #[JsonProperty("exception")]
    public mixed $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty("stdout")]
    public string $stdout;

    /**
     * @param bool $passed
     * @param mixed $actualResult
     * @param mixed $exception
     * @param string $stdout
     */
    public function __construct(
        bool $passed,
        mixed $actualResult,
        mixed $exception,
        string $stdout,
    ) {
        $this->passed = $passed;
        $this->actualResult = $actualResult;
        $this->exception = $exception;
        $this->stdout = $stdout;
    }
}
