<?php

namespace Seed\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Circle extends SerializableType
{
    /**
     * @var float $radius
     */
    #[JsonProperty("radius")]
    public float $radius;

    /**
     * @param float $radius
     */
    public function __construct(
        float $radius,
    ) {
        $this->radius = $radius;
    }
}
