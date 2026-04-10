<?php

namespace Seed\Traits;

use Seed\ExecutionSessionStatus;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 * @property value-of<ExecutionSessionStatus> $status
 */
trait BuildingExecutorResponse
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var value-of<ExecutionSessionStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;
}
