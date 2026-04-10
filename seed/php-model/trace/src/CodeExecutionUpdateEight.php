<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RecordedResponseNotification;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateEight extends JsonSerializableType
{
    use RecordedResponseNotification;

    /**
     * @var value-of<CodeExecutionUpdateEightType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   traceResponsesSize: int,
     *   type: value-of<CodeExecutionUpdateEightType>,
     *   testCaseId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->traceResponsesSize = $values['traceResponsesSize'];
        $this->testCaseId = $values['testCaseId'] ?? null;
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
