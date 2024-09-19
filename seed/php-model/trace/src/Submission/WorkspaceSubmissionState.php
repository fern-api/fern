<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WorkspaceSubmissionState extends SerializableType
{
    /**
     * @var mixed $status
     */
    #[JsonProperty("status")]
    public mixed $status;

    /**
     * @param mixed $status
     */
    public function __construct(
        mixed $status,
    ) {
        $this->status = $status;
    }
}
