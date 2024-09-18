<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TraceResponsesPageV2 extends SerializableType
{
    /**
     * @var array<TraceResponseV2> $traceResponses
     */
    #[JsonProperty("traceResponses"), ArrayType([TraceResponseV2::class])]
    public array $traceResponses;

    /**
     * @var ?int $offset If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
     */
    #[JsonProperty("offset")]
    public ?int $offset;

    /**
     * @param array<TraceResponseV2> $traceResponses
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
