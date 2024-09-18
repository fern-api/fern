<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SendResponse extends SerializableType
{
    #[JsonProperty("message")]
    /**
     * @var string $message
     */
    public string $message;

    #[JsonProperty("status")]
    /**
     * @var int $status
     */
    public int $status;

    #[JsonProperty("success")]
    /**
     * @var bool $success
     */
    public bool $success;

    /**
     * @param string $message
     * @param int $status
     * @param bool $success
     */
    public function __construct(
        string $message,
        int $status,
        bool $success,
    ) {
        $this->message = $message;
        $this->status = $status;
        $this->success = $success;
    }
}
