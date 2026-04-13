<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\EmailNotification;
use Seed\Core\Json\JsonProperty;

class NotificationMethodZero extends JsonSerializableType
{
    use EmailNotification;

    /**
     * @var value-of<NotificationMethodZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   emailAddress: string,
     *   subject: string,
     *   type: value-of<NotificationMethodZeroType>,
     *   htmlContent?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->emailAddress = $values['emailAddress'];
        $this->subject = $values['subject'];
        $this->htmlContent = $values['htmlContent'] ?? null;
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
