<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamEventContextProtocolTwo extends JsonSerializableType
{
    /**
     * @var value-of<StreamEventContextProtocolTwoEvent> $event
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
     *   event: value-of<StreamEventContextProtocolTwoEvent>,
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
