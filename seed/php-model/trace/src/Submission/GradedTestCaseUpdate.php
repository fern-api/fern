<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GradedTestCaseUpdate extends SerializableType
{
    #[JsonProperty("testCaseId")]
    /**
     * @var string $testCaseId
     */
    public string $testCaseId;

    #[JsonProperty("grade")]
    /**
     * @var mixed $grade
     */
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
