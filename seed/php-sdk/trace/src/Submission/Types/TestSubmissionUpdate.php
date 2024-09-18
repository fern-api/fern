<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use DateTime;

class TestSubmissionUpdate extends SerializableType
{
    #[JsonProperty("updateTime"), DateType(DateType::TYPE_DATETIME)]
    /**
     * @var DateTime $updateTime
     */
    public DateTime $updateTime;

    #[JsonProperty("updateInfo")]
    /**
     * @var mixed $updateInfo
     */
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
