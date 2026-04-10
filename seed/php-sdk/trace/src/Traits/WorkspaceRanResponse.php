<?php

namespace Seed\Traits;

use Seed\Types\WorkspaceRunDetails;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $submissionId
 * @property WorkspaceRunDetails $runDetails
 */
trait WorkspaceRanResponse
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var WorkspaceRunDetails $runDetails
     */
    #[JsonProperty('runDetails')]
    public WorkspaceRunDetails $runDetails;
}
