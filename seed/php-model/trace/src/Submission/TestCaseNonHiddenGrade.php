<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseNonHiddenGrade extends SerializableType
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @var mixed $actualResult
     */
    #[JsonProperty('actualResult')]
    public mixed $actualResult;

    /**
     * @var mixed $exception
     */
    #[JsonProperty('exception')]
    public mixed $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;

    /**
     * @param array{
     *   passed: bool,
     *   actualResult: mixed,
     *   exception: mixed,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->passed = $values['passed'];
        $this->actualResult = $values['actualResult'];
        $this->exception = $values['exception'];
        $this->stdout = $values['stdout'];
    }
}
