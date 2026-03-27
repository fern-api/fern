<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ProtocolCollisionObjectEvent extends JsonSerializableType
{
    /**
     * @var ObjectPayloadWithEventField $data
     */
    #[JsonProperty('data')]
    public ObjectPayloadWithEventField $data;

    /**
     * @param array{
     *   data: ObjectPayloadWithEventField,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
