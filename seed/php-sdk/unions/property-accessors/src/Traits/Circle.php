<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property float $radius
 */
trait Circle
{
    /**
     * @var float $radius
     */
    #[JsonProperty('radius')]
    private float $radius;

    /**
     * @return float
     */
    public function getRadius(): float
    {
        return $this->radius;
    }

    /**
     * @param float $value
     */
    public function setRadius(float $value): self
    {
        $this->radius = $value;
        $this->_setField('radius');
        return $this;
    }
}
