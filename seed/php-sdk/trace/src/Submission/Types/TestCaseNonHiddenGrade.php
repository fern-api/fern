<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\VariableValue;

class TestCaseNonHiddenGrade extends JsonSerializableType
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @var ?VariableValue $actualResult
     */
    #[JsonProperty('actualResult')]
    public ?VariableValue $actualResult;

    /**
     * @var ?ExceptionV2 $exception
     */
    #[JsonProperty('exception')]
    public ?ExceptionV2 $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;

    /**
     * @param array{
     *   passed: bool,
     *   stdout: string,
     *   actualResult?: ?VariableValue,
     *   exception?: ?ExceptionV2,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->passed = $values['passed'];$this->actualResult = $values['actualResult'] ?? null;$this->exception = $values['exception'] ?? null;$this->stdout = $values['stdout'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
