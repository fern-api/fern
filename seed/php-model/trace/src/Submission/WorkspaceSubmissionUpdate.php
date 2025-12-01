<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class WorkspaceSubmissionUpdate extends JsonSerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty('updateTime'), Date(Date::TYPE_DATETIME)]
    public DateTime $updateTime;

    /**
     * @var WorkspaceSubmissionUpdateInfo $updateInfo
     */
    #[JsonProperty('updateInfo')]
    public WorkspaceSubmissionUpdateInfo $updateInfo;

    /**
     * @param array{
     *   updateTime: DateTime,
     *   updateInfo: WorkspaceSubmissionUpdateInfo,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->updateTime = $values['updateTime'];$this->updateInfo = $values['updateInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
