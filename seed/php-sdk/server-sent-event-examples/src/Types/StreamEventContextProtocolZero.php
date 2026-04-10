<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CompletionEvent;
use Seed\Core\Json\JsonProperty;

class StreamEventContextProtocolZero extends JsonSerializableType
{
    use CompletionEvent;

    /**
     * @var value-of<StreamEventContextProtocolZeroEvent> $event
     */
    #[JsonProperty('event')]
    public string $event;

    /**
     * @param array{
     *   content: string,
     *   event: value-of<StreamEventContextProtocolZeroEvent>,
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
