<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\ExceptionInfo;

class InternalError extends SerializableType
{
    #[JsonProperty("exceptionInfo")]
    /**
     * @var ExceptionInfo $exceptionInfo
     */
    public ExceptionInfo $exceptionInfo;

    /**
     * @param ExceptionInfo $exceptionInfo
     */
    public function __construct(
        ExceptionInfo $exceptionInfo,
    ) {
        $this->exceptionInfo = $exceptionInfo;
    }
}
