<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceSubmissionStatusV2 extends JsonSerializableType
{
    /**
     * @var array<WorkspaceSubmissionUpdate> $updates
     */
    #[JsonProperty('updates'), ArrayType([WorkspaceSubmissionUpdate::class])]
    public array $updates;

    /**
     * @param array{
     *   updates: array<WorkspaceSubmissionUpdate>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->updates = $values['updates'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
