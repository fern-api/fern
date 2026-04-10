<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\SmsNotification;
use Seed\Core\Json\JsonProperty;

class NotificationMethodOne extends JsonSerializableType
{
    use SmsNotification;

    /**
     * @var value-of<NotificationMethodOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   phoneNumber: string,
     *   message: string,
     *   type: value-of<NotificationMethodOneType>,
     *   shortCode?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->phoneNumber = $values['phoneNumber'];
        $this->message = $values['message'];
        $this->shortCode = $values['shortCode'] ?? null;
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
