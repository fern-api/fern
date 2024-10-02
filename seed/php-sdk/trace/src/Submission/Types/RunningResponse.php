<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class RunningResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var value-of<RunningSubmissionState> $state
     */
    #[JsonProperty('state')]
    public string $state;

    /**
     * @param array{
     *   submissionId: string,
     *   state: value-of<RunningSubmissionState>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->state = $values['state'];
    }
}
