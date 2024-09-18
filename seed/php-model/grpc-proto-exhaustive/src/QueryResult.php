<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class QueryResult extends SerializableType
{
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
     * @param ?array<ScoredColumn> $matches
     * @param ?string $namespace
     */
    public function __construct(
        ?array $matches = null,
        ?string $namespace = null,
    ) {
        $this->matches = $matches;
        $this->namespace = $namespace;
    }
}
