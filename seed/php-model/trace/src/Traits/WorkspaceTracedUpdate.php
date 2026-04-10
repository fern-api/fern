<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property int $traceResponsesSize
 */
trait WorkspaceTracedUpdate
{
    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty('traceResponsesSize')]
    public int $traceResponsesSize;
}
