<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\TestCaseResultWithStdout;

class GradedResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("testCases"), ArrayType(["string" => TestCaseResultWithStdout])]
    /**
     * @var array<string, TestCaseResultWithStdout> $testCases
     */
    public array $testCases;

    /**
     * @param string $submissionId
     * @param array<string, TestCaseResultWithStdout> $testCases
     */
    public function __construct(
        string $submissionId,
        array $testCases,
    ) {
        $this->submissionId = $submissionId;
        $this->testCases = $testCases;
    }
}
