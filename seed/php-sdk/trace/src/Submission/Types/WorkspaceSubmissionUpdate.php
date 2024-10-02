<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\DateType;

class WorkspaceSubmissionUpdate extends SerializableType
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
