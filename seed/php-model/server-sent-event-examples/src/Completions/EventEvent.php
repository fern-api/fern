<?php

namespace Seed\Completions;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class EventEvent extends JsonSerializableType
{
    /**
     * @var string $event
     */
    #[JsonProperty('event')]
    public string $event;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   event: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->event = $values['event'];
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
