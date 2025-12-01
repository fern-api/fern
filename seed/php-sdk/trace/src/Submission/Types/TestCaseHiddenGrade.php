<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseHiddenGrade extends JsonSerializableType
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
    )
    {
        $this->passed = $values['passed'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
