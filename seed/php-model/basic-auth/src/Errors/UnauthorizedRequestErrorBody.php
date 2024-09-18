<?php

namespace Seed\Errors;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UnauthorizedRequestErrorBody extends SerializableType
{
    #[JsonProperty("message")]
    /**
     * @var string $message
     */
    public string $message;

    /**
     * @param string $message
     */
    public function __construct(
        string $message,
    ) {
        $this->message = $message;
    }
}
