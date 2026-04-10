<?php

namespace Seed\Traits;

use Seed\Types\LightweightStackframeInformation;
use Seed\Types\TracedFile;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 * @property ?string $testCaseId
 * @property int $lineNumber
 * @property LightweightStackframeInformation $lightweightStackInfo
 * @property ?TracedFile $tracedFile
 */
trait RecordingResponseNotification
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var ?string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public ?string $testCaseId;

    /**
     * @var int $lineNumber
     */
    #[JsonProperty('lineNumber')]
    public int $lineNumber;

    /**
     * @var LightweightStackframeInformation $lightweightStackInfo
     */
    #[JsonProperty('lightweightStackInfo')]
    public LightweightStackframeInformation $lightweightStackInfo;

    /**
     * @var ?TracedFile $tracedFile
     */
    #[JsonProperty('tracedFile')]
    public ?TracedFile $tracedFile;
}
