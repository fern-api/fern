<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class SearchResponse extends JsonSerializableType
{
    /**
     * @var array<Resource> $results
     */
    #[JsonProperty('results'), ArrayType([Resource::class])]
    public array $results;

    /**
     * @var ?int $total
     */
    #[JsonProperty('total')]
    public ?int $total;

    /**
     * @var ?int $nextOffset
     */
    #[JsonProperty('next_offset')]
    public ?int $nextOffset;

    /**
     * @param array{
     *   results: array<Resource>,
     *   total?: ?int,
     *   nextOffset?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->results = $values['results'];$this->total = $values['total'] ?? null;$this->nextOffset = $values['nextOffset'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
