<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class WorkspaceSubmissionState extends JsonSerializableType
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

    /**
     * @param array{
     *   status: (
     *    WorkspaceSubmissionStatusZero
     *   |WorkspaceSubmissionStatusOne
     *   |WorkspaceSubmissionStatusType
     *   |WorkspaceSubmissionStatusThree
     *   |WorkspaceSubmissionStatusFour
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
