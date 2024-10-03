<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListResponse extends JsonSerializableType
{
    /**
     * @var ?array<ListElement> $columns
     */
    #[JsonProperty('columns'), ArrayType([ListElement::class])]
    public ?array $columns;

    /**
     * @var ?Pagination $pagination
     */
    #[JsonProperty('pagination')]
    public ?Pagination $pagination;

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
     *   columns?: ?array<ListElement>,
     *   pagination?: ?Pagination,
     *   namespace?: ?string,
     *   usage?: ?Usage,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->columns = $values['columns'] ?? null;
        $this->pagination = $values['pagination'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->usage = $values['usage'] ?? null;
    }
}
