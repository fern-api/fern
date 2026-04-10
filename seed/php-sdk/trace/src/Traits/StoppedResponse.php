<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 */
trait StoppedResponse
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;
}
