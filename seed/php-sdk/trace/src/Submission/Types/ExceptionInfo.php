<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExceptionInfo extends SerializableType
{
    /**
     * @var string $exceptionType
     */
    #[JsonProperty("exceptionType")]
    public string $exceptionType;

    /**
     * @var string $exceptionMessage
     */
    #[JsonProperty("exceptionMessage")]
    public string $exceptionMessage;

    /**
     * @var string $exceptionStacktrace
     */
    #[JsonProperty("exceptionStacktrace")]
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
