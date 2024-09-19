<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DescribeResponse extends SerializableType
{
    /**
     * @var ?array<string, NamespaceSummary> $namespaces
     */
    #[JsonProperty("namespaces"), ArrayType(["string" => NamespaceSummary::class])]
    public ?array $namespaces;

    /**
     * @var ?int $dimension
     */
    #[JsonProperty("dimension")]
    public ?int $dimension;

    /**
     * @var ?float $fullness
     */
    #[JsonProperty("fullness")]
    public ?float $fullness;

    /**
     * @var ?int $totalCount
     */
    #[JsonProperty("totalCount")]
    public ?int $totalCount;

    /**
     * @param ?array<string, NamespaceSummary> $namespaces
     * @param ?int $dimension
     * @param ?float $fullness
     * @param ?int $totalCount
     */
    public function __construct(
        ?array $namespaces = null,
        ?int $dimension = null,
        ?float $fullness = null,
        ?int $totalCount = null,
    ) {
        $this->namespaces = $namespaces;
        $this->dimension = $dimension;
        $this->fullness = $fullness;
        $this->totalCount = $totalCount;
    }
}
