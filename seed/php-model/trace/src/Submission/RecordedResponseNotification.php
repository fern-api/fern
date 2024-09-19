<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RecordedResponseNotification extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty("traceResponsesSize")]
    public int $traceResponsesSize;

    /**
     * @var ?string $testCaseId
     */
    #[JsonProperty("testCaseId")]
    public ?string $testCaseId;

    /**
     * @param string $submissionId
     * @param int $traceResponsesSize
     * @param ?string $testCaseId
     */
    public function __construct(
        string $submissionId,
        int $traceResponsesSize,
        ?string $testCaseId = null,
    ) {
        $this->submissionId = $submissionId;
        $this->traceResponsesSize = $traceResponsesSize;
        $this->testCaseId = $testCaseId;
    }
}
