<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionState extends JsonSerializableType
{
    /**
     * @var WorkspaceSubmissionStatus $status
     */
    #[JsonProperty('status')]
    public WorkspaceSubmissionStatus $status;

    /**
     * @param array{
     *   status: WorkspaceSubmissionStatus,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
