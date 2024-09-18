<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RecordedResponseNotification extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("traceResponsesSize")]
    /**
     * @var int $traceResponsesSize
     */
    public int $traceResponsesSize;

    #[JsonProperty("testCaseId")]
    /**
     * @var ?string $testCaseId
     */
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
