<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GradedResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var array<string, TestCaseResultWithStdout> $testCases
     */
    #[JsonProperty("testCases"), ArrayType(["string" => TestCaseResultWithStdout::class])]
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
