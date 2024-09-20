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
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, TestCaseResultWithStdout>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->testCases = $values['testCases'];
    }
}
