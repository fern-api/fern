<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\EntityEventPayload;
use DateTime;

class DataContextEntityEvent extends JsonSerializableType
{
    use EntityEventPayload;


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
