<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceSubmissionState extends JsonSerializableType
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

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
