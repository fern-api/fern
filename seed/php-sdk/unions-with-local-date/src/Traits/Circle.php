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
    public float $radius;
}
