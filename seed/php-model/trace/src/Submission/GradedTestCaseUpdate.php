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
     * @param string $testCaseId
     * @param mixed $grade
     */
    public function __construct(
        string $testCaseId,
        mixed $grade,
    ) {
        $this->testCaseId = $testCaseId;
        $this->grade = $grade;
    }
}
