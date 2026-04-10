<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionUpdateInfoZero extends JsonSerializableType
{
    /**
     * @var value-of<WorkspaceSubmissionUpdateInfoZeroType> $type
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
     *   type: value-of<WorkspaceSubmissionUpdateInfoZeroType>,
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
