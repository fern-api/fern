<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property ?string $stringifiedType
 * @property string $stringifiedValue
 */
trait GenericValue
{
    /**
     * @var ?string $stringifiedType
     */
    #[JsonProperty('stringifiedType')]
    public ?string $stringifiedType;

    /**
     * @var string $stringifiedValue
     */
    #[JsonProperty('stringifiedValue')]
    public string $stringifiedValue;
}
