<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\LightweightStackframeInformation;
use Seed\Submission\Types\TracedFile;

class RecordingResponseNotification extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("lineNumber")]
    /**
     * @var int $lineNumber
     */
    public int $lineNumber;

    #[JsonProperty("lightweightStackInfo")]
    /**
     * @var LightweightStackframeInformation $lightweightStackInfo
     */
    public LightweightStackframeInformation $lightweightStackInfo;

    #[JsonProperty("testCaseId")]
    /**
     * @var ?string $testCaseId
     */
    public ?string $testCaseId;

    #[JsonProperty("tracedFile")]
    /**
     * @var ?TracedFile $tracedFile
     */
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
