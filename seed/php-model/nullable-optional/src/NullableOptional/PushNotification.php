<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PushNotification extends JsonSerializableType
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

    /**
     * @param array{
     *   deviceToken: string,
     *   title: string,
     *   body: string,
     *   badge?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->deviceToken = $values['deviceToken'];$this->title = $values['title'];$this->body = $values['body'];$this->badge = $values['badge'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
