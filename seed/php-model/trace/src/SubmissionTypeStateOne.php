<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\WorkspaceSubmissionState;
use Seed\Core\Json\JsonProperty;

class SubmissionTypeStateOne extends JsonSerializableType
{
    use WorkspaceSubmissionState;

    /**
     * @var value-of<SubmissionTypeStateOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   status: (
     *    WorkspaceSubmissionStatusZero
     *   |WorkspaceSubmissionStatusOne
     *   |WorkspaceSubmissionStatusType
     *   |WorkspaceSubmissionStatusThree
     *   |WorkspaceSubmissionStatusFour
     * ),
     *   type: value-of<SubmissionTypeStateOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->status = $values['status'];
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
