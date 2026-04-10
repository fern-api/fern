<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 * @property int $traceResponsesSize
 * @property ?string $testCaseId
 */
trait RecordedResponseNotification
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty('traceResponsesSize')]
    public int $traceResponsesSize;

    /**
     * @var ?string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public ?string $testCaseId;
}
