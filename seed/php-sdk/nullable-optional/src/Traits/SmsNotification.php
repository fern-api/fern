<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $phoneNumber
 * @property string $message
 * @property ?string $shortCode
 */
trait SmsNotification
{
    /**
     * @var string $phoneNumber
     */
    #[JsonProperty('phoneNumber')]
    public string $phoneNumber;

    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @var ?string $shortCode
     */
    #[JsonProperty('shortCode')]
    public ?string $shortCode;
}
