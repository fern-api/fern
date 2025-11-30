<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SmsNotification extends JsonSerializableType
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

    /**
     * @param array{
     *   phoneNumber: string,
     *   message: string,
     *   shortCode?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->phoneNumber = $values['phoneNumber'];$this->message = $values['message'];$this->shortCode = $values['shortCode'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
