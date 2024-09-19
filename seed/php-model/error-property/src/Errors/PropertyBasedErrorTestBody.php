<?php

namespace Seed\Errors;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class PropertyBasedErrorTestBody extends SerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty("message")]
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
