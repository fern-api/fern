<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Column;
use Seed\Usage;

class FetchResponse extends SerializableType
{
    #[JsonProperty("columns"), ArrayType(["string" => Column::class])]
    /**
     * @var ?array<string, Column> $columns
     */
    public ?array $columns;

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
     * @param ?array<string, Column> $columns
     * @param ?string $namespace_
     * @param ?Usage $usage
     */
    public function __construct(
        ?array $columns = null,
        ?string $namespace_ = null,
        ?Usage $usage = null,
    ) {
        $this->columns = $columns;
        $this->namespace_ = $namespace_;
        $this->usage = $usage;
    }
}
