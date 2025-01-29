<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class TraceResponsesPage extends JsonSerializableType
{
    /**
     * @var ?int $offset If present, use this to load subsequent pages.
    The offset is the id of the next trace response to load.
     */
    #[JsonProperty('offset')]
    public ?int $offset;

    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty('traceResponses'), ArrayType([TraceResponse::class])]
    public array $traceResponses;

    /**
     * @param array{
     *   offset?: ?int,
     *   traceResponses: array<TraceResponse>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->offset = $values['offset'] ?? null;
        $this->traceResponses = $values['traceResponses'];
    }
}
