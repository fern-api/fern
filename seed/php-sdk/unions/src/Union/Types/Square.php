<?php

namespace Seed\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Square extends SerializableType
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
}
