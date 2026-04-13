<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $value
 */
trait GaseousRoad
{
    /**
     * @var string $value
     */
    #[JsonProperty('value')]
    public string $value;
}
