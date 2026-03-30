<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Event extends JsonSerializableType
{
    /**
     * @var string $data
     */
    #[JsonProperty('data')]
    public string $data;

    /**
     * @var ?string $event
     */
    #[JsonProperty('event')]
    public ?string $event;

    /**
     * @var ?string $id
     */
    #[JsonProperty('id')]
    public ?string $id;

    /**
     * @var ?int $retry
     */
    #[JsonProperty('retry')]
    public ?int $retry;

    /**
     * @param array{
     *   data: string,
     *   event?: ?string,
     *   id?: ?string,
     *   retry?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->event = $values['event'] ?? null;
        $this->id = $values['id'] ?? null;
        $this->retry = $values['retry'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
