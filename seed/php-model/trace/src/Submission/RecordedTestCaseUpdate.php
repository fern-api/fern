<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RecordedTestCaseUpdate extends SerializableType
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty("testCaseId")]
    public string $testCaseId;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty("traceResponsesSize")]
    public int $traceResponsesSize;

    /**
     * @param string $testCaseId
     * @param int $traceResponsesSize
     */
    public function __construct(
        string $testCaseId,
        int $traceResponsesSize,
    ) {
        $this->testCaseId = $testCaseId;
        $this->traceResponsesSize = $traceResponsesSize;
    }
}
