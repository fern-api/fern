<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class TestSubmissionUpdate extends JsonSerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty('updateTime'), Date(Date::TYPE_DATETIME)]
    public DateTime $updateTime;

    /**
     * @var TestSubmissionUpdateInfo $updateInfo
     */
    #[JsonProperty('updateInfo')]
    public TestSubmissionUpdateInfo $updateInfo;

    /**
     * @param array{
     *   updateTime: DateTime,
     *   updateInfo: TestSubmissionUpdateInfo,
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
