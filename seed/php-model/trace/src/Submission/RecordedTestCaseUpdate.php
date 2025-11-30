<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RecordedTestCaseUpdate extends JsonSerializableType
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

    /**
     * @param array{
     *   testCaseId: string,
     *   traceResponsesSize: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->testCaseId = $values['testCaseId'];$this->traceResponsesSize = $values['traceResponsesSize'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
