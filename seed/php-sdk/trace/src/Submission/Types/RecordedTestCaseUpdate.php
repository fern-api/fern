<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RecordedTestCaseUpdate extends SerializableType
{
    #[JsonProperty("testCaseId")]
    /**
     * @var string $testCaseId
     */
    public string $testCaseId;

    #[JsonProperty("traceResponsesSize")]
    /**
     * @var int $traceResponsesSize
     */
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
