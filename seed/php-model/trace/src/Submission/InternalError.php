<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\ExceptionInfo;

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
