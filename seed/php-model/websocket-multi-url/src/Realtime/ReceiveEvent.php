<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ReceiveEvent extends JsonSerializableType
{
    /**
     * @var string $data
     */
    #[JsonProperty('data')]
    public string $data;

    /**
     * @var int $timestamp
     */
    #[JsonProperty('timestamp')]
    public int $timestamp;

    /**
     * @param array{
     *   data: string,
     *   timestamp: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->timestamp = $values['timestamp'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
