<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceTracedUpdate extends SerializableType
{
    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty('traceResponsesSize')]
    public int $traceResponsesSize;

    /**
     * @param array{
     *   traceResponsesSize: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->traceResponsesSize = $values['traceResponsesSize'];
    }
}
