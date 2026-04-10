<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class GradedTestCaseUpdate extends JsonSerializableType
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public string $testCaseId;

    /**
     * @var (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * ) $grade
     */
    #[JsonProperty('grade'), Union(TestCaseGradeZero::class, TestCaseGradeOne::class)]
    public TestCaseGradeZero|TestCaseGradeOne $grade;

    /**
     * @param array{
     *   testCaseId: string,
     *   grade: (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCaseId = $values['testCaseId'];
        $this->grade = $values['grade'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
