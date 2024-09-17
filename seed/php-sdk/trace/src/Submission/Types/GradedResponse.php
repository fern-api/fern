<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\Types\TestCaseResultWithStdout;

class GradedResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("testCases"), ArrayType(["string" => TestCaseResultWithStdout::class])]
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
