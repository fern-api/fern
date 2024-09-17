<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\WorkspaceSubmissionUpdate;

class WorkspaceSubmissionStatusV2 extends SerializableType
{
    #[JsonProperty("updates"), ArrayType([WorkspaceSubmissionUpdate])]
    /**
     * @var array<WorkspaceSubmissionUpdate> $updates
     */
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
