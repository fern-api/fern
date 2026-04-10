<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $message
 * @property string $type
 * @property string $stacktrace
 */
trait GenericCreateProblemError
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @var string $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $stacktrace
     */
    #[JsonProperty('stacktrace')]
    public string $stacktrace;
}
