<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

trait AliasType
{
    /**
     * @var string $parent
     */
    #[JsonProperty('parent')]
    public string $parent;
}
