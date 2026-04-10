<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $missingSubmissionId
 */
trait SubmissionIdNotFound
{
    /**
     * @var string $missingSubmissionId
     */
    #[JsonProperty('missingSubmissionId')]
    public string $missingSubmissionId;
}
