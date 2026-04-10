<?php

namespace Seed\Traits;

use Seed\WorkspaceSubmissionStatusZero;
use Seed\WorkspaceSubmissionStatusOne;
use Seed\WorkspaceSubmissionStatusType;
use Seed\WorkspaceSubmissionStatusThree;
use Seed\WorkspaceSubmissionStatusFour;
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
