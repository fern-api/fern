<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property float $length
 */
trait Square
{
    /**
     * @var float $length
     */
    #[JsonProperty('length')]
    private float $length;

    /**
     * @return float
     */
    public function getLength(): float
    {
        return $this->length;
    }

    /**
     * @param float $value
     */
    public function setLength(float $value): self
    {
        $this->length = $value;
        $this->_setField('length');
        return $this;
    }
}
