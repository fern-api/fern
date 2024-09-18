<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\RunningSubmissionState;

class RunningResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("state")]
    /**
     * @var RunningSubmissionState $state
     */
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
