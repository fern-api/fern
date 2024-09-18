<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GradedResponseV2 extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("testCases"), ArrayType(["string" => "mixed"])]
    /**
     * @var array<string, mixed> $testCases
     */
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
