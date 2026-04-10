<?php

namespace Seed\Traits;

use Seed\Types\ExceptionInfo;
use Seed\Core\Json\JsonProperty;

/**
 * @property ExceptionInfo $exceptionInfo
 */
trait InternalError
{
    /**
     * @var ExceptionInfo $exceptionInfo
     */
    #[JsonProperty('exceptionInfo')]
    public ExceptionInfo $exceptionInfo;
}
