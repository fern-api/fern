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
     * @param array{
     *   radius: float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->radius = $values['radius'];
    }
}
