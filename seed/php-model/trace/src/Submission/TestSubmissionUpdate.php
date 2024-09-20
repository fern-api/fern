<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use DateTime;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;

class TestSubmissionUpdate extends SerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty('updateTime'), DateType(DateType::TYPE_DATETIME)]
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
}
