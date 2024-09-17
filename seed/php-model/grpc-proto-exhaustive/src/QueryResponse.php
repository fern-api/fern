<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\QueryResult;
use Seed\ScoredColumn;
use Seed\Usage;

class QueryResponse extends SerializableType
{
    #[JsonProperty("results"), ArrayType([QueryResult])]
    /**
     * @var ?array<QueryResult> $results
     */
    public ?array $results;

    #[JsonProperty("matches"), ArrayType([ScoredColumn])]
    /**
     * @var ?array<ScoredColumn> $matches
     */
    public ?array $matches;

    #[JsonProperty("namespace")]
    /**
     * @var ?string $namespace
     */
    public ?string $namespace;

    #[JsonProperty("usage")]
    /**
     * @var ?Usage $usage
     */
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
