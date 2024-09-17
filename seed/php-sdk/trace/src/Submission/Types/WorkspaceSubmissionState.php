<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WorkspaceSubmissionState extends SerializableType
{
    #[JsonProperty("status")]
    /**
     * @var mixed $status
     */
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
