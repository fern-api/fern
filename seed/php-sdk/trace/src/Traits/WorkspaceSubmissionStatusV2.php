<?php

namespace Seed\Traits;

use Seed\Types\WorkspaceSubmissionUpdate;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<WorkspaceSubmissionUpdate> $updates
 */
trait WorkspaceSubmissionStatusV2
{
    /**
     * @var array<WorkspaceSubmissionUpdate> $updates
     */
    #[JsonProperty('updates'), ArrayType([WorkspaceSubmissionUpdate::class])]
    public array $updates;
}
