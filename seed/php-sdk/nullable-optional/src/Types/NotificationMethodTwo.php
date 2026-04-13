<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PushNotification;
use Seed\Core\Json\JsonProperty;

class NotificationMethodTwo extends JsonSerializableType
{
    use PushNotification;

    /**
     * @var value-of<NotificationMethodTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   deviceToken: string,
     *   title: string,
     *   body: string,
     *   type: value-of<NotificationMethodTwoType>,
     *   badge?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->deviceToken = $values['deviceToken'];
        $this->title = $values['title'];
        $this->body = $values['body'];
        $this->badge = $values['badge'] ?? null;
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
