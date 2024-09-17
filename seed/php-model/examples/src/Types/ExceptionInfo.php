<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExceptionInfo extends SerializableType
{
    #[JsonProperty("exceptionType")]
    /**
     * @var string $exceptionType
     */
    public string $exceptionType;

    #[JsonProperty("exceptionMessage")]
    /**
     * @var string $exceptionMessage
     */
    public string $exceptionMessage;

    #[JsonProperty("exceptionStacktrace")]
    /**
     * @var string $exceptionStacktrace
     */
    public string $exceptionStacktrace;

    /**
     * @param string $exceptionType
     * @param string $exceptionMessage
     * @param string $exceptionStacktrace
     */
    public function __construct(
        string $exceptionType,
        string $exceptionMessage,
        string $exceptionStacktrace,
    ) {
        $this->exceptionType = $exceptionType;
        $this->exceptionMessage = $exceptionMessage;
        $this->exceptionStacktrace = $exceptionStacktrace;
    }
}
