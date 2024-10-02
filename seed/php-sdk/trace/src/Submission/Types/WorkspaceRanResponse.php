<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceRanResponse extends SerializableType
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

    /**
     * @param array{
     *   submissionId: string,
     *   runDetails: WorkspaceRunDetails,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->runDetails = $values['runDetails'];
    }
}
