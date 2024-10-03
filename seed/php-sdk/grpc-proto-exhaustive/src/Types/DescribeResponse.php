<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class DescribeResponse extends JsonSerializableType
{
    /**
     * @var ?array<string, NamespaceSummary> $namespaces
     */
    #[JsonProperty('namespaces'), ArrayType(['string' => NamespaceSummary::class])]
    public ?array $namespaces;

    /**
     * @var ?int $dimension
     */
    #[JsonProperty('dimension')]
    public ?int $dimension;

    /**
     * @var ?float $fullness
     */
    #[JsonProperty('fullness')]
    public ?float $fullness;

    /**
     * @var ?int $totalCount
     */
    #[JsonProperty('totalCount')]
    public ?int $totalCount;

    /**
     * @param array{
     *   namespaces?: ?array<string, NamespaceSummary>,
     *   dimension?: ?int,
     *   fullness?: ?float,
     *   totalCount?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->namespaces = $values['namespaces'] ?? null;
        $this->dimension = $values['dimension'] ?? null;
        $this->fullness = $values['fullness'] ?? null;
        $this->totalCount = $values['totalCount'] ?? null;
    }
}
