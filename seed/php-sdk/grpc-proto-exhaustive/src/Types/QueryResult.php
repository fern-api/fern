<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class QueryResult extends SerializableType
{
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
     * @param array{
     *   matches?: ?array<ScoredColumn>,
     *   namespace?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->matches = $values['matches'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
    }
}
