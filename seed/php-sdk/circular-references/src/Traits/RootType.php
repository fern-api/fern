<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

trait RootType
{
    /**
     * @var string $s
     */
    #[JsonProperty('s')]
    public string $s;
}
