<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RecordedResponseNotification extends JsonSerializableType
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

    /**
     * @param array{
     *   submissionId: string,
     *   traceResponsesSize: int,
     *   testCaseId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->traceResponsesSize = $values['traceResponsesSize'];$this->testCaseId = $values['testCaseId'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
