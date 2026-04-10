<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\WorkspaceSubmissionUpdate;

class AdminSendWorkspaceSubmissionUpdateRequest extends JsonSerializableType
{
    /**
     * @var WorkspaceSubmissionUpdate $body
     */
    public WorkspaceSubmissionUpdate $body;

    /**
     * @param array{
     *   body: WorkspaceSubmissionUpdate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
