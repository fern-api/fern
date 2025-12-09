<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Circle extends JsonSerializableType
{
    /**
     * @var float $radius
     */
    #[JsonProperty('radius')]
    public float $radius;

    /**
     * @param array{
     *   radius: float,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->radius = $values['radius'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
