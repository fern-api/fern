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
}
