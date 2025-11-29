<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceRanResponse extends JsonSerializableType
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
    )
    {
        $this->submissionId = $values['submissionId'];$this->runDetails = $values['runDetails'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
