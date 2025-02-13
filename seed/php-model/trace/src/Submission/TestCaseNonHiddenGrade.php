<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseNonHiddenGrade extends JsonSerializableType
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
     *   stdout: string,
     *   actualResult?: mixed,
     *   exception?: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->passed = $values['passed'];
        $this->actualResult = $values['actualResult'] ?? null;
        $this->exception = $values['exception'] ?? null;
        $this->stdout = $values['stdout'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
