<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TraceResponsesPage extends SerializableType
{
    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty("traceResponses"), ArrayType([TraceResponse::class])]
    public array $traceResponses;

    /**
     * @var ?int $offset If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
     */
    #[JsonProperty("offset")]
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
