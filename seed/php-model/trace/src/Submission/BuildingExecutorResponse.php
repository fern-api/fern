<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BuildingExecutorResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var ExecutionSessionStatus $status
     */
    #[JsonProperty("status")]
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
