<?php

namespace Seed\Submission\Types;

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
     * @param array{
     *   testCaseId: string,
     *   traceResponsesSize: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCaseId = $values['testCaseId'];
        $this->traceResponsesSize = $values['traceResponsesSize'];
    }
}
