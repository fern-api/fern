<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SmsStatusPayload extends JsonSerializableType
{
    /**
     * @var string $messageSid
     */
    #[JsonProperty('messageSid')]
    public string $messageSid;

    /**
     * @var string $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   messageSid: string,
     *   status: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->messageSid = $values['messageSid'];
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
