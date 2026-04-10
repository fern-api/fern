<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceTracedUpdate;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionUpdateInfoFour extends JsonSerializableType
{
    use WorkspaceTracedUpdate;

    /**
     * @var value-of<WorkspaceSubmissionUpdateInfoFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   traceResponsesSize: int,
     *   type: value-of<WorkspaceSubmissionUpdateInfoFourType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->traceResponsesSize = $values['traceResponsesSize'];
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
