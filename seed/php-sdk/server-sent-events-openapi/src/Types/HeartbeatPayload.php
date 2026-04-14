<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class HeartbeatPayload extends JsonSerializableType
{
    /**
     * @var ?DateTime $timestamp
     */
    #[JsonProperty('timestamp'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $timestamp;

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
