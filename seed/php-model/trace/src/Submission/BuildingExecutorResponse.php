<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BuildingExecutorResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var ExecutionSessionStatus $status
     */
    #[JsonProperty('status')]
    public ExecutionSessionStatus $status;

    /**
     * @param array{
     *   submissionId: string,
     *   status: ExecutionSessionStatus,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->status = $values['status'];
    }
}
