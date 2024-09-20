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
     * @param array{
     *   status: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->status = $values['status'];
    }
}
