<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GradedTestCaseUpdate extends SerializableType
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty("testCaseId")]
    public string $testCaseId;

    /**
     * @var mixed $grade
     */
    #[JsonProperty("grade")]
    public mixed $grade;

    /**
     * @param array{
     *   testCaseId: string,
     *   grade: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCaseId = $values['testCaseId'];
        $this->grade = $values['grade'];
    }
}
