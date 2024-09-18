<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericCreateProblemError extends SerializableType
{
    #[JsonProperty("message")]
    /**
     * @var string $message
     */
    public string $message;

    #[JsonProperty("type")]
    /**
     * @var string $type
     */
    public string $type;

    #[JsonProperty("stacktrace")]
    /**
     * @var string $stacktrace
     */
    public string $stacktrace;

    /**
     * @param string $message
     * @param string $type
     * @param string $stacktrace
     */
    public function __construct(
        string $message,
        string $type,
        string $stacktrace,
    ) {
        $this->message = $message;
        $this->type = $type;
        $this->stacktrace = $stacktrace;
    }
}
