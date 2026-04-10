<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ErrorEvent;
use Seed\Core\Json\JsonProperty;

class StreamEventContextProtocolOne extends JsonSerializableType
{
    use ErrorEvent;

    /**
     * @var value-of<StreamEventContextProtocolOneEvent> $event
     */
    #[JsonProperty('event')]
    public string $event;

    /**
     * @param array{
     *   error: string,
     *   event: value-of<StreamEventContextProtocolOneEvent>,
     *   code?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->error = $values['error'];
        $this->code = $values['code'] ?? null;
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
