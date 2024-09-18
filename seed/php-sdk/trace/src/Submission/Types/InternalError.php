<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InternalError extends SerializableType
{
    /**
     * @var ExceptionInfo $exceptionInfo
     */
    #[JsonProperty("exceptionInfo")]
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
