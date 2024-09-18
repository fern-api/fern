<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RecordingResponseNotification extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var int $lineNumber
     */
    #[JsonProperty("lineNumber")]
    public int $lineNumber;

    /**
     * @var LightweightStackframeInformation $lightweightStackInfo
     */
    #[JsonProperty("lightweightStackInfo")]
    public LightweightStackframeInformation $lightweightStackInfo;

    /**
     * @var ?string $testCaseId
     */
    #[JsonProperty("testCaseId")]
    public ?string $testCaseId;

    /**
     * @var ?TracedFile $tracedFile
     */
    #[JsonProperty("tracedFile")]
    public ?TracedFile $tracedFile;

    /**
     * @param string $submissionId
     * @param int $lineNumber
     * @param LightweightStackframeInformation $lightweightStackInfo
     * @param ?string $testCaseId
     * @param ?TracedFile $tracedFile
     */
    public function __construct(
        string $submissionId,
        int $lineNumber,
        LightweightStackframeInformation $lightweightStackInfo,
        ?string $testCaseId = null,
        ?TracedFile $tracedFile = null,
    ) {
        $this->submissionId = $submissionId;
        $this->lineNumber = $lineNumber;
        $this->lightweightStackInfo = $lightweightStackInfo;
        $this->testCaseId = $testCaseId;
        $this->tracedFile = $tracedFile;
    }
}
