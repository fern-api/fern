<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseResult extends JsonSerializableType
{
    /**
     * @var mixed $expectedResult
     */
    #[JsonProperty('expectedResult')]
    public mixed $expectedResult;

    /**
     * @var mixed $actualResult
     */
    #[JsonProperty('actualResult')]
    public mixed $actualResult;

    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @param array{
     *   expectedResult: mixed,
     *   actualResult: mixed,
     *   passed: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedResult = $values['expectedResult'];
        $this->actualResult = $values['actualResult'];
        $this->passed = $values['passed'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
