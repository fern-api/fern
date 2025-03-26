<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Square extends JsonSerializableType
{
    /**
     * @var float $length
     */
    #[JsonProperty('length')]
    public float $length;

    /**
     * @param array{
     *   length: float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->length = $values['length'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
