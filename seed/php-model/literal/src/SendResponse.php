<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SendResponse extends SerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty("message")]
    public string $message;

    /**
     * @var int $status
     */
    #[JsonProperty("status")]
    public int $status;

    /**
     * @var bool $success
     */
    #[JsonProperty("success")]
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
