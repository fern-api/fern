<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class QueryResponse extends SerializableType
{
    /**
     * @var ?array<QueryResult> $results
     */
    #[JsonProperty("results"), ArrayType([QueryResult::class])]
    public ?array $results;

    /**
     * @var ?array<ScoredColumn> $matches
     */
    #[JsonProperty("matches"), ArrayType([ScoredColumn::class])]
    public ?array $matches;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

    /**
     * @var ?Usage $usage
     */
    #[JsonProperty("usage")]
    public ?Usage $usage;

    /**
     * @param ?array<QueryResult> $results
     * @param ?array<ScoredColumn> $matches
     * @param ?string $namespace
     * @param ?Usage $usage
     */
    public function __construct(
        ?array $results = null,
        ?array $matches = null,
        ?string $namespace = null,
        ?Usage $usage = null,
    ) {
        $this->results = $results;
        $this->matches = $matches;
        $this->namespace = $namespace;
        $this->usage = $usage;
    }
}
