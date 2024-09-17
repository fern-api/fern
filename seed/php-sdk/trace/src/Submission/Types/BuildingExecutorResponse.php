<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\ExecutionSessionStatus;

class BuildingExecutorResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("status")]
    /**
     * @var ExecutionSessionStatus $status
     */
    public ExecutionSessionStatus $status;

    /**
     * @param string $submissionId
     * @param ExecutionSessionStatus $status
     */
    public function __construct(
        string $submissionId,
        ExecutionSessionStatus $status,
    ) {
        $this->submissionId = $submissionId;
        $this->status = $status;
    }
}
