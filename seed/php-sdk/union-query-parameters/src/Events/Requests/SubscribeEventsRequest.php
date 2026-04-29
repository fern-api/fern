<?php

namespace Seed\Events\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Events\Types\EventTypeEnum;

class SubscribeEventsRequest extends JsonSerializableType
{
    /**
     * @var (
     *    value-of<EventTypeEnum>
     *   |array<value-of<EventTypeEnum>>
     * )|null $eventType
     */
    public string|array|null $eventType;

    /**
     * @var (
     *    string
     *   |array<string>
     * )|null $tags
     */
    public string|array|null $tags;

    /**
     * @param array{
     *   eventType?: (
     *    value-of<EventTypeEnum>
     *   |array<value-of<EventTypeEnum>>
     * )|null,
     *   tags?: (
     *    string
     *   |array<string>
     * )|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->eventType = $values['eventType'] ?? null;
        $this->tags = $values['tags'] ?? null;
    }
}
