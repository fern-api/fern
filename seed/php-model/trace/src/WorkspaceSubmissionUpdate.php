<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;
use Seed\Core\Types\Union;

class WorkspaceSubmissionUpdate extends JsonSerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty('updateTime'), Date(Date::TYPE_DATETIME)]
    public DateTime $updateTime;

    /**
     * @var (
     *    WorkspaceSubmissionUpdateInfoZero
     *   |WorkspaceSubmissionUpdateInfoOne
     *   |WorkspaceSubmissionUpdateInfoTwo
     *   |WorkspaceSubmissionUpdateInfoThree
     *   |WorkspaceSubmissionUpdateInfoFour
     *   |WorkspaceSubmissionUpdateInfoFive
     *   |WorkspaceSubmissionUpdateInfoType
     * ) $updateInfo
     */
    #[JsonProperty('updateInfo'), Union(WorkspaceSubmissionUpdateInfoZero::class, WorkspaceSubmissionUpdateInfoOne::class, WorkspaceSubmissionUpdateInfoTwo::class, WorkspaceSubmissionUpdateInfoThree::class, WorkspaceSubmissionUpdateInfoFour::class, WorkspaceSubmissionUpdateInfoFive::class, WorkspaceSubmissionUpdateInfoType::class)]
    public WorkspaceSubmissionUpdateInfoZero|WorkspaceSubmissionUpdateInfoOne|WorkspaceSubmissionUpdateInfoTwo|WorkspaceSubmissionUpdateInfoThree|WorkspaceSubmissionUpdateInfoFour|WorkspaceSubmissionUpdateInfoFive|WorkspaceSubmissionUpdateInfoType $updateInfo;

    /**
     * @param array{
     *   updateTime: DateTime,
     *   updateInfo: (
     *    WorkspaceSubmissionUpdateInfoZero
     *   |WorkspaceSubmissionUpdateInfoOne
     *   |WorkspaceSubmissionUpdateInfoTwo
     *   |WorkspaceSubmissionUpdateInfoThree
     *   |WorkspaceSubmissionUpdateInfoFour
     *   |WorkspaceSubmissionUpdateInfoFive
     *   |WorkspaceSubmissionUpdateInfoType
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->updateTime = $values['updateTime'];
        $this->updateInfo = $values['updateInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
