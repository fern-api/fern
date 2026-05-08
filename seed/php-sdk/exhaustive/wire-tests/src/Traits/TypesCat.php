<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $name
 * @property bool $likesToMeow
 */
trait TypesCat
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var bool $likesToMeow
     */
    #[JsonProperty('likesToMeow')]
    public bool $likesToMeow;
}
