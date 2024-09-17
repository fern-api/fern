<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\NamespaceSummary;

class DescribeResponse extends SerializableType
{
    #[JsonProperty("namespaces"), ArrayType(["string" => NamespaceSummary])]
    /**
     * @var ?array<string, NamespaceSummary> $namespaces
     */
    public ?array $namespaces;

    #[JsonProperty("dimension")]
    /**
     * @var ?int $dimension
     */
    public ?int $dimension;

    #[JsonProperty("fullness")]
    /**
     * @var ?float $fullness
     */
    public ?float $fullness;

    #[JsonProperty("totalCount")]
    /**
     * @var ?int $totalCount
     */
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
