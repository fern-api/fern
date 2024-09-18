<?php

namespace Seed\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Square extends SerializableType
{
    /**
     * @var float $length
     */
    #[JsonProperty("length")]
    public float $length;

    /**
     * @param float $length
     */
    public function __construct(
        float $length,
    ) {
        $this->length = $length;
    }
}
