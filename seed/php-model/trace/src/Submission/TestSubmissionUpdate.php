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
     * @var mixed $updateInfo
     */
    #[JsonProperty('updateInfo')]
    public mixed $updateInfo;

    /**
     * @param array{
     *   updateTime: DateTime,
     *   updateInfo: mixed,
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
