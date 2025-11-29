<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $parent
 */
trait Parent_ 
{
    /**
     * @var string $parent
     */
    #[JsonProperty('parent')]
    public string $parent;
}
