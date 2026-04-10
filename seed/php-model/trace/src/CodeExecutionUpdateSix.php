<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceRanResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateSix extends JsonSerializableType
{
    use WorkspaceRanResponse;

    /**
     * @var value-of<CodeExecutionUpdateSixType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   runDetails: WorkspaceRunDetails,
     *   type: value-of<CodeExecutionUpdateSixType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->runDetails = $values['runDetails'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
