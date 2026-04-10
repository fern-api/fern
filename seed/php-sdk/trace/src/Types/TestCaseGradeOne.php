<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TestCaseNonHiddenGrade;
use Seed\Core\Json\JsonProperty;

class TestCaseGradeOne extends JsonSerializableType
{
    use TestCaseNonHiddenGrade;

    /**
     * @var value-of<TestCaseGradeOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   passed: bool,
     *   stdout: string,
     *   type: value-of<TestCaseGradeOneType>,
     *   actualResult?: (
     *    VariableValueZero
     *   |VariableValueOne
     *   |VariableValueTwo
     *   |VariableValueThree
     *   |VariableValueFour
     *   |VariableValueFive
     *   |VariableValueSix
     *   |VariableValueSeven
     *   |VariableValueEight
     *   |VariableValueNine
     *   |VariableValueType
     * )|null,
     *   exception?: (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->passed = $values['passed'];
        $this->actualResult = $values['actualResult'] ?? null;
        $this->exception = $values['exception'] ?? null;
        $this->stdout = $values['stdout'];
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
