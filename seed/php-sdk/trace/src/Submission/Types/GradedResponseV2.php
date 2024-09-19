<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GradedResponseV2 extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var array<string, mixed> $testCases
     */
    #[JsonProperty("testCases"), ArrayType(["string" => "mixed"])]
    public array $testCases;

    /**
     * @param string $submissionId
     * @param array<string, mixed> $testCases
     */
    public function __construct(
        string $submissionId,
        array $testCases,
    ) {
        $this->submissionId = $submissionId;
        $this->testCases = $testCases;
    }
}
