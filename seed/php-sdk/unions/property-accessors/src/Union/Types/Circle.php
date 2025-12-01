<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Circle extends JsonSerializableType
{
    /**
     * @var float $radius
     */
    #[JsonProperty('radius')]
    private float $radius;

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
     * @return float
     */
    public function getRadius(): float {
        return $this->radius;}

    /**
     * @param float $value
     */
    public function setRadius(float $value): self {
        $this->radius = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
