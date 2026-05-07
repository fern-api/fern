<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $name
 * @property bool $likesToWoof
 */
trait TypesDog
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var bool $likesToWoof
     */
    #[JsonProperty('likesToWoof')]
    public bool $likesToWoof;
}
