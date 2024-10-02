<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class QueryResponse extends JsonSerializableType
{
    /**
     * @var ?array<QueryResult> $results
     */
    #[JsonProperty('results'), ArrayType([QueryResult::class])]
    public ?array $results;

    /**
     * @var ?array<ScoredColumn> $matches
     */
    #[JsonProperty('matches'), ArrayType([ScoredColumn::class])]
    public ?array $matches;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var ?Usage $usage
     */
    #[JsonProperty('usage')]
    public ?Usage $usage;

    /**
     * @param array{
     *   results?: ?array<QueryResult>,
     *   matches?: ?array<ScoredColumn>,
     *   namespace?: ?string,
     *   usage?: ?Usage,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->results = $values['results'] ?? null;
        $this->matches = $values['matches'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->usage = $values['usage'] ?? null;
    }
}
