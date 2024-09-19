<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericCreateProblemError extends SerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty("message")]
    public string $message;

    /**
     * @var string $type
     */
    #[JsonProperty("type")]
    public string $type;

    /**
     * @var string $stacktrace
     */
    #[JsonProperty("stacktrace")]
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
