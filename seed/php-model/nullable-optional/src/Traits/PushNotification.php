<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $deviceToken
 * @property string $title
 * @property string $body
 * @property ?int $badge
 */
trait PushNotification
{
    /**
     * @var string $deviceToken
     */
    #[JsonProperty('deviceToken')]
    public string $deviceToken;

    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    public string $title;

    /**
     * @var string $body
     */
    #[JsonProperty('body')]
    public string $body;

    /**
     * @var ?int $badge
     */
    #[JsonProperty('badge')]
    public ?int $badge;
}
