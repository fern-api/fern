<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\VariableValue;
use Seed\Core\Json\JsonProperty;

class TestCaseResult extends JsonSerializableType
{
    /**
     * @var VariableValue $expectedResult
     */
    #[JsonProperty('expectedResult')]
    public VariableValue $expectedResult;

    /**
     * @var ActualResult $actualResult
     */
    #[JsonProperty('actualResult')]
    public ActualResult $actualResult;

    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @param array{
     *   expectedResult: VariableValue,
     *   actualResult: ActualResult,
     *   passed: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->expectedResult = $values['expectedResult'];$this->actualResult = $values['actualResult'];$this->passed = $values['passed'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
