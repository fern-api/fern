<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TestCaseHiddenGrade;
use Seed\Core\Json\JsonProperty;

class TestCaseGradeZero extends JsonSerializableType
{
    use TestCaseHiddenGrade;

    /**
     * @var value-of<TestCaseGradeZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   passed: bool,
     *   type: value-of<TestCaseGradeZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->passed = $values['passed'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
