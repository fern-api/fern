<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GradedTestCaseUpdate extends JsonSerializableType
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public string $testCaseId;

    /**
     * @var TestCaseGrade $grade
     */
    #[JsonProperty('grade')]
    public TestCaseGrade $grade;

    /**
     * @param array{
     *   testCaseId: string,
     *   grade: TestCaseGrade,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->testCaseId = $values['testCaseId'];$this->grade = $values['grade'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
