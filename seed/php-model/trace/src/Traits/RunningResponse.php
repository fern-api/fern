<?php

namespace Seed\Traits;

use Seed\RunningSubmissionState;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 * @property value-of<RunningSubmissionState> $state
 */
trait RunningResponse
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
}
