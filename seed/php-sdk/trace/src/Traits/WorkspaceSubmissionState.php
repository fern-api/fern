<?php

namespace Seed\Traits;

use Seed\Types\WorkspaceSubmissionStatusZero;
use Seed\Types\WorkspaceSubmissionStatusOne;
use Seed\Types\WorkspaceSubmissionStatusType;
use Seed\Types\WorkspaceSubmissionStatusThree;
use Seed\Types\WorkspaceSubmissionStatusFour;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property (
 *    WorkspaceSubmissionStatusZero
 *   |WorkspaceSubmissionStatusOne
 *   |WorkspaceSubmissionStatusType
 *   |WorkspaceSubmissionStatusThree
 *   |WorkspaceSubmissionStatusFour
 * ) $status
 */
trait WorkspaceSubmissionState
{
    /**
     * @var (
     *    WorkspaceSubmissionStatusZero
     *   |WorkspaceSubmissionStatusOne
     *   |WorkspaceSubmissionStatusType
     *   |WorkspaceSubmissionStatusThree
     *   |WorkspaceSubmissionStatusFour
     * ) $status
     */
    #[JsonProperty('status'), Union(WorkspaceSubmissionStatusZero::class, WorkspaceSubmissionStatusOne::class, WorkspaceSubmissionStatusType::class, WorkspaceSubmissionStatusThree::class, WorkspaceSubmissionStatusFour::class)]
    public WorkspaceSubmissionStatusZero|WorkspaceSubmissionStatusOne|WorkspaceSubmissionStatusType|WorkspaceSubmissionStatusThree|WorkspaceSubmissionStatusFour $status;
}
