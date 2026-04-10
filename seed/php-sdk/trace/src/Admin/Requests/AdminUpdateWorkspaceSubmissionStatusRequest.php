<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\WorkspaceSubmissionStatusZero;
use Seed\Types\WorkspaceSubmissionStatusOne;
use Seed\Types\WorkspaceSubmissionStatusType;
use Seed\Types\WorkspaceSubmissionStatusThree;
use Seed\Types\WorkspaceSubmissionStatusFour;

class AdminUpdateWorkspaceSubmissionStatusRequest extends JsonSerializableType
{
    /**
     * @var (
     *    WorkspaceSubmissionStatusZero
     *   |WorkspaceSubmissionStatusOne
     *   |WorkspaceSubmissionStatusType
     *   |WorkspaceSubmissionStatusThree
     *   |WorkspaceSubmissionStatusFour
     * ) $body
     */
    public WorkspaceSubmissionStatusZero|WorkspaceSubmissionStatusOne|WorkspaceSubmissionStatusType|WorkspaceSubmissionStatusThree|WorkspaceSubmissionStatusFour $body;

    /**
     * @param array{
     *   body: (
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
        $this->body = $values['body'];
    }
}
