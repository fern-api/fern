<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ProtocolObjectEvent extends JsonSerializableType
{
    /**
     * @var StatusPayload $data
     */
    #[JsonProperty('data')]
    public StatusPayload $data;

    /**
     * @param array{
     *   data: StatusPayload,
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
