<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class SubmissionStatusForTestCaseType extends JsonSerializableType
{
    /**
     * @var value-of<SubmissionStatusForTestCaseTypeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * )|null $value
     */
    #[JsonProperty('value'), Union(TestCaseGradeZero::class, TestCaseGradeOne::class, 'null')]
    public TestCaseGradeZero|TestCaseGradeOne|null $value;

    /**
     * @param array{
     *   type: value-of<SubmissionStatusForTestCaseTypeType>,
     *   value?: (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * )|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
