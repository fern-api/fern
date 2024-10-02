<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionState extends SerializableType
{
    /**
     * @var mixed $status
     */
    #[JsonProperty('status')]
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
