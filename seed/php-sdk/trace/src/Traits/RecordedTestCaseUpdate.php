<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $testCaseId
 * @property int $traceResponsesSize
 */
trait RecordedTestCaseUpdate
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public string $testCaseId;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty('traceResponsesSize')]
    public int $traceResponsesSize;
}
