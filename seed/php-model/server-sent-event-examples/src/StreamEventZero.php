<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CompletionEvent;
use Seed\Core\Json\JsonProperty;

class StreamEventZero extends JsonSerializableType
{
    use CompletionEvent;

    /**
     * @var value-of<StreamEventZeroEvent> $event
     */
    #[JsonProperty('event')]
    public string $event;

    /**
     * @param array{
     *   content: string,
     *   event: value-of<StreamEventZeroEvent>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->content = $values['content'];
        $this->event = $values['event'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
