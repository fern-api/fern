<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionStatusType extends JsonSerializableType
{
    /**
     * @var value-of<WorkspaceSubmissionStatusTypeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?value-of<RunningSubmissionState> $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   type: value-of<WorkspaceSubmissionStatusTypeType>,
     *   value?: ?value-of<RunningSubmissionState>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
