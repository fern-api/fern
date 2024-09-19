<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ListResponse extends SerializableType
{
    /**
     * @var ?array<ListElement> $columns
     */
    #[JsonProperty("columns"), ArrayType([ListElement::class])]
    public ?array $columns;

    /**
     * @var ?Pagination $pagination
     */
    #[JsonProperty("pagination")]
    public ?Pagination $pagination;

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
     * @param ?array<ListElement> $columns
     * @param ?Pagination $pagination
     * @param ?string $namespace
     * @param ?Usage $usage
     */
    public function __construct(
        ?array $columns = null,
        ?Pagination $pagination = null,
        ?string $namespace = null,
        ?Usage $usage = null,
    ) {
        $this->columns = $columns;
        $this->pagination = $pagination;
        $this->namespace = $namespace;
        $this->usage = $usage;
    }
}
