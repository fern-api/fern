<?php

namespace Seed\Traits;

use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

/**
 * @property ?DateTime $timestamp
 */
trait HeartbeatPayload
{
    /**
     * @var ?DateTime $timestamp
     */
    #[JsonProperty('timestamp'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $timestamp;
}
