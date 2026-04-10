<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RecordingResponseNotification;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateSeven extends JsonSerializableType
{
    use RecordingResponseNotification;

    /**
     * @var value-of<CodeExecutionUpdateSevenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   lineNumber: int,
     *   lightweightStackInfo: LightweightStackframeInformation,
     *   type: value-of<CodeExecutionUpdateSevenType>,
     *   testCaseId?: ?string,
     *   tracedFile?: ?TracedFile,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->testCaseId = $values['testCaseId'] ?? null;
        $this->lineNumber = $values['lineNumber'];
        $this->lightweightStackInfo = $values['lightweightStackInfo'];
        $this->tracedFile = $values['tracedFile'] ?? null;
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
