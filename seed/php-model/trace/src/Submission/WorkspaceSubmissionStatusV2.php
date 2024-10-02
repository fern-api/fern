<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceSubmissionStatusV2 extends SerializableType
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
    ) {
        $this->updates = $values['updates'];
    }
}
