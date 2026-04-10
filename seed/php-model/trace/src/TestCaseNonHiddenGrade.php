<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TestCaseNonHiddenGrade extends JsonSerializableType
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @var (
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
     * )|null $actualResult
     */
    #[JsonProperty('actualResult'), Union(VariableValueZero::class, VariableValueOne::class, VariableValueTwo::class, VariableValueThree::class, VariableValueFour::class, VariableValueFive::class, VariableValueSix::class, VariableValueSeven::class, VariableValueEight::class, VariableValueNine::class, VariableValueType::class, 'null')]
    public VariableValueZero|VariableValueOne|VariableValueTwo|VariableValueThree|VariableValueFour|VariableValueFive|VariableValueSix|VariableValueSeven|VariableValueEight|VariableValueNine|VariableValueType|null $actualResult;

    /**
     * @var (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null $exception
     */
    #[JsonProperty('exception'), Union(ExceptionV2Zero::class, ExceptionV2Type::class, 'null')]
    public ExceptionV2Zero|ExceptionV2Type|null $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;

    /**
     * @param array{
     *   passed: bool,
     *   stdout: string,
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
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
