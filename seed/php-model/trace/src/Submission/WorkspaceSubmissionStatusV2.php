<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WorkspaceSubmissionStatusV2 extends SerializableType
{
    /**
     * @var array<WorkspaceSubmissionUpdate> $updates
     */
    #[JsonProperty("updates"), ArrayType([WorkspaceSubmissionUpdate::class])]
    public array $updates;

    /**
     * @param array<WorkspaceSubmissionUpdate> $updates
     */
    public function __construct(
        array $updates,
    ) {
        $this->updates = $updates;
    }
}
