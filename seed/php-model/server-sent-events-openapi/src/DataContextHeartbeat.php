<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\HeartbeatPayload;
use DateTime;

class DataContextHeartbeat extends JsonSerializableType
{
    use HeartbeatPayload;


    /**
     * @param array{
     *   timestamp?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->timestamp = $values['timestamp'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
