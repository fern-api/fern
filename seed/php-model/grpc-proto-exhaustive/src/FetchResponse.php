<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class FetchResponse extends SerializableType
{
    /**
     * @var ?array<string, Column> $columns
     */
    #[JsonProperty("columns"), ArrayType(["string" => Column::class])]
    public ?array $columns;

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
     * @param ?array<string, Column> $columns
     * @param ?string $namespace
     * @param ?Usage $usage
     */
    public function __construct(
        ?array $columns = null,
        ?string $namespace = null,
        ?Usage $usage = null,
    ) {
        $this->columns = $columns;
        $this->namespace = $namespace;
        $this->usage = $usage;
    }
}
