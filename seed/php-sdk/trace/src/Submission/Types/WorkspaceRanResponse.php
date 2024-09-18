<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\WorkspaceRunDetails;

class WorkspaceRanResponse extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("runDetails")]
    /**
     * @var WorkspaceRunDetails $runDetails
     */
    public WorkspaceRunDetails $runDetails;

    /**
     * @param string $submissionId
     * @param WorkspaceRunDetails $runDetails
     */
    public function __construct(
        string $submissionId,
        WorkspaceRunDetails $runDetails,
    ) {
        $this->submissionId = $submissionId;
        $this->runDetails = $runDetails;
    }
}
