<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceTracedUpdate extends JsonSerializableType
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
    )
    {
        $this->traceResponsesSize = $values['traceResponsesSize'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
