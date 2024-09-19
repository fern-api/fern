<?php

namespace Seed\GeneralErrors;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BadObjectRequestInfo extends SerializableType
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
