<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $error
 * @property ?int $code
 */
trait ErrorEvent
{
    /**
     * @var string $error
     */
    #[JsonProperty('error')]
    public string $error;

    /**
     * @var ?int $code
     */
    #[JsonProperty('code')]
    public ?int $code;
}
