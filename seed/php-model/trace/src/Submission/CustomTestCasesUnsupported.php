<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CustomTestCasesUnsupported extends SerializableType
{
    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
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
