<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BuildingExecutorResponse extends JsonSerializableType
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

    /**
     * @param array{
     *   submissionId: string,
     *   status: value-of<ExecutionSessionStatus>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
