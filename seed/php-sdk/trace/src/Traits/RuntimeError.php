<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $message
 */
trait RuntimeError
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;
}
