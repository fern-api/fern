<?php

namespace Seed\Traits;

use Seed\EntityEventPayloadEventType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

/**
 * @property ?string $entityId
 * @property ?value-of<EntityEventPayloadEventType> $eventType
 * @property ?DateTime $updatedTime
 */
trait EntityEventPayload
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
}
