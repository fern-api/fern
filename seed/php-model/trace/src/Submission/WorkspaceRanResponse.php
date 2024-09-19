<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WorkspaceRanResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var WorkspaceRunDetails $runDetails
     */
    #[JsonProperty("runDetails")]
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
