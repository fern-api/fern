<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $name
 */
trait Organization
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;
}
