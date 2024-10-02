<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseHiddenGrade extends SerializableType
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @param array{
     *   passed: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->passed = $values['passed'];
    }
}
