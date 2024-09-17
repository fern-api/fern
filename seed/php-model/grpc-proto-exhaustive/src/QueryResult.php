<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\ScoredColumn;

class QueryResult extends SerializableType
{
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

    /**
     * @param ?array<ScoredColumn> $matches
     * @param ?string $namespace_
     */
    public function __construct(
        ?array $matches = null,
        ?string $namespace_ = null,
    ) {
        $this->matches = $matches;
        $this->namespace_ = $namespace_;
    }
}
