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
    public float $length;
}
