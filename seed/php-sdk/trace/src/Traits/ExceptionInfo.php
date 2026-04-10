<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $exceptionType
 * @property string $exceptionMessage
 * @property string $exceptionStacktrace
 */
trait ExceptionInfo
{
    /**
     * @var string $exceptionType
     */
    #[JsonProperty('exceptionType')]
    public string $exceptionType;

    /**
     * @var string $exceptionMessage
     */
    #[JsonProperty('exceptionMessage')]
    public string $exceptionMessage;

    /**
     * @var string $exceptionStacktrace
     */
    #[JsonProperty('exceptionStacktrace')]
    public string $exceptionStacktrace;
}
