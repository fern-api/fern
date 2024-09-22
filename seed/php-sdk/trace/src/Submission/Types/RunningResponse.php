<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RunningResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var RunningSubmissionState $state
     */
    #[JsonProperty('state')]
    public RunningSubmissionState $state;

    /**
     * @param array{
     *   submissionId: string,
     *   state: RunningSubmissionState,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->state = $values['state'];
    }
}
