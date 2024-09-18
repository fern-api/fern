<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use DateTime;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;

class WorkspaceSubmissionUpdate extends SerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty("updateTime"), DateType(DateType::TYPE_DATETIME)]
    public DateTime $updateTime;

    /**
     * @var mixed $updateInfo
     */
    #[JsonProperty("updateInfo")]
    public mixed $updateInfo;

    /**
     * @param DateTime $updateTime
     * @param mixed $updateInfo
     */
    public function __construct(
        DateTime $updateTime,
        mixed $updateInfo,
    ) {
        $this->updateTime = $updateTime;
        $this->updateInfo = $updateInfo;
    }
}
