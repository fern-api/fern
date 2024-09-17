<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WorkspaceTracedUpdate extends SerializableType
{
    #[JsonProperty("traceResponsesSize")]
    /**
     * @var int $traceResponsesSize
     */
    public int $traceResponsesSize;

    /**
     * @param int $traceResponsesSize
     */
    public function __construct(
        int $traceResponsesSize,
    ) {
        $this->traceResponsesSize = $traceResponsesSize;
    }
}
