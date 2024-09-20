<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class TraceResponsesPageV2 extends SerializableType
{
    /**
     * @var ?int $offset If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
     */
    #[JsonProperty("offset")]
    public ?int $offset;

    /**
     * @var array<TraceResponseV2> $traceResponses
     */
    #[JsonProperty("traceResponses"), ArrayType([TraceResponseV2::class])]
    public array $traceResponses;

    /**
     * @param array{
     *   offset?: ?int,
     *   traceResponses: array<TraceResponseV2>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->offset = $values['offset'] ?? null;
        $this->traceResponses = $values['traceResponses'];
    }
}
