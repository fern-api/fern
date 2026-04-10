<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ErrorEvent;
use Seed\Core\Json\JsonProperty;

class StreamEventOne extends JsonSerializableType
{
    use ErrorEvent;

    /**
     * @var value-of<StreamEventOneEvent> $event
     */
    #[JsonProperty('event')]
    public string $event;

    /**
     * @param array{
     *   error: string,
     *   event: value-of<StreamEventOneEvent>,
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
