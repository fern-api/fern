<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendResponse extends JsonSerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @var int $status
     */
    #[JsonProperty('status')]
    public int $status;

    /**
     * @var true $success
     */
    #[JsonProperty('success')]
    public bool $success;

    /**
     * @param array{
     *   message: string,
     *   status: int,
     *   success: true,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->message = $values['message'];$this->status = $values['status'];$this->success = $values['success'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
