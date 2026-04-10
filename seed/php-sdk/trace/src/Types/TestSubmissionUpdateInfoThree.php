<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GradedTestCaseUpdate;
use Seed\Core\Json\JsonProperty;

class TestSubmissionUpdateInfoThree extends JsonSerializableType
{
    use GradedTestCaseUpdate;

    /**
     * @var value-of<TestSubmissionUpdateInfoThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   testCaseId: string,
     *   grade: (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * ),
     *   type: value-of<TestSubmissionUpdateInfoThreeType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCaseId = $values['testCaseId'];
        $this->grade = $values['grade'];
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
