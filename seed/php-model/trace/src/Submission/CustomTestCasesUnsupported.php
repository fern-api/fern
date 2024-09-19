<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CustomTestCasesUnsupported extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @param string $problemId
     * @param string $submissionId
     */
    public function __construct(
        string $problemId,
        string $submissionId,
    ) {
        $this->problemId = $problemId;
        $this->submissionId = $submissionId;
    }
}
