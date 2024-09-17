<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\QueryResult;
use Seed\Types\ScoredColumn;
use Seed\Types\Usage;

class QueryResponse extends SerializableType
{
    #[JsonProperty("results"), ArrayType([QueryResult::class])]
    /**
     * @var ?array<QueryResult> $results
     */
    public ?array $results;

    #[JsonProperty("matches"), ArrayType([ScoredColumn::class])]
    /**
     * @var ?array<ScoredColumn> $matches
     */
    public ?array $matches;

    #[JsonProperty("namespace")]
    /**
     * @var ?string $namespace_
     */
    public ?string $namespace_;

    #[JsonProperty("usage")]
    /**
     * @var ?Usage $usage
     */
    public ?Usage $usage;

    /**
     * @param ?array<QueryResult> $results
     * @param ?array<ScoredColumn> $matches
     * @param ?string $namespace_
     * @param ?Usage $usage
     */
    public function __construct(
        ?array $results = null,
        ?array $matches = null,
        ?string $namespace_ = null,
        ?Usage $usage = null,
    ) {
        $this->results = $results;
        $this->matches = $matches;
        $this->namespace_ = $namespace_;
        $this->usage = $usage;
    }
}
