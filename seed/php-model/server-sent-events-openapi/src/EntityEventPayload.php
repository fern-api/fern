<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class EntityEventPayload extends JsonSerializableType
{
    /**
     * @var ?string $entityId
     */
    #[JsonProperty('entityId')]
    public ?string $entityId;

    /**
     * @var ?value-of<EntityEventPayloadEventType> $eventType
     */
    #[JsonProperty('eventType')]
    public ?string $eventType;

    /**
     * @var ?DateTime $updatedTime
     */
    #[JsonProperty('updatedTime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $updatedTime;

    /**
     * @param array{
     *   entityId?: ?string,
     *   eventType?: ?value-of<EntityEventPayloadEventType>,
     *   updatedTime?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->entityId = $values['entityId'] ?? null;
        $this->eventType = $values['eventType'] ?? null;
        $this->updatedTime = $values['updatedTime'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
