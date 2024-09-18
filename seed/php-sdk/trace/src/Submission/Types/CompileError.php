<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CompileError extends SerializableType
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
