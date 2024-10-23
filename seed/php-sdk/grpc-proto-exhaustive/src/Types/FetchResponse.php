<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class FetchResponse extends JsonSerializableType
{
    /**
     * @var ?array<string, Column> $columns
     */
    #[JsonProperty('columns'), ArrayType(['string' => Column::class])]
    public ?array $columns;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var ?Usage $usage
     */
    #[JsonProperty('usage')]
    public ?Usage $usage;

    /**
     * @param array{
     *   columns?: ?array<string, Column>,
     *   namespace?: ?string,
     *   usage?: ?Usage,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->columns = $values['columns'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->usage = $values['usage'] ?? null;
    }
}
