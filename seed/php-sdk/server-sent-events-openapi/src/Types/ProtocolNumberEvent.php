<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ProtocolNumberEvent extends JsonSerializableType
{
    /**
     * @var float $data
     */
    #[JsonProperty('data')]
    public float $data;

    /**
     * @param array{
     *   data: float,
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
