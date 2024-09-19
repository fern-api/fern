<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RunningResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var RunningSubmissionState $state
     */
    #[JsonProperty("state")]
    public RunningSubmissionState $state;

    /**
     * @param string $submissionId
     * @param RunningSubmissionState $state
     */
    public function __construct(
        string $submissionId,
        RunningSubmissionState $state,
    ) {
        $this->submissionId = $submissionId;
        $this->state = $state;
    }
}
