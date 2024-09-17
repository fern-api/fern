<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\Types\TraceResponse;

class TraceResponsesPage extends SerializableType
{
    #[JsonProperty("traceResponses"), ArrayType([TraceResponse])]
    /**
     * @var array<TraceResponse> $traceResponses
     */
    public array $traceResponses;

    #[JsonProperty("offset")]
    /**
     * @var ?int $offset If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
     */
    public ?int $offset;

    /**
     * @param array<TraceResponse> $traceResponses
     * @param ?int $offset If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
     */
    public function __construct(
        array $traceResponses,
        ?int $offset = null,
    ) {
        $this->traceResponses = $traceResponses;
        $this->offset = $offset;
    }
}
