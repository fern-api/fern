<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $s
 */
trait RootType 
{
    /**
     * @var string $s
     */
    #[JsonProperty('s')]
    public string $s;
}
