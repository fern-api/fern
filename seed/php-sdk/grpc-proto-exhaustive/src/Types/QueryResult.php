<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\ScoredColumn;

class QueryResult extends SerializableType
{
    #[JsonProperty("matches"), ArrayType([ScoredColumn::class])]
    /**
     * @var ?array<ScoredColumn> $matches
     */
    public ?array $matches;

    #[JsonProperty("namespace")]
    /**
     * @var ?string $namespace
     */
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
