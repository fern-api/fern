<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Types\QueryColumn;
use Seed\Core\ArrayType;
use Seed\Types\IndexedData;

class QueryRequest
{
    /**
     * @var int $topK
     */
    #[JsonProperty("topK")]
    public int $topK;

    /**
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

    /**
     * @var ?bool $includeValues
     */
    #[JsonProperty("includeValues")]
    public ?bool $includeValues;

    /**
     * @var ?bool $includeMetadata
     */
    #[JsonProperty("includeMetadata")]
    public ?bool $includeMetadata;

    /**
     * @var ?array<QueryColumn> $queries
     */
    #[JsonProperty("queries"), ArrayType([QueryColumn::class])]
    public ?array $queries;

    /**
     * @var ?array<float> $column
     */
    #[JsonProperty("column"), ArrayType(["float"])]
    public ?array $column;

    /**
     * @var ?string $id
     */
    #[JsonProperty("id")]
    public ?string $id;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty("indexedData")]
    public ?IndexedData $indexedData;

    /**
     * @param int $topK
     * @param mixed $filter
     * @param ?string $namespace
     * @param ?bool $includeValues
     * @param ?bool $includeMetadata
     * @param ?array<QueryColumn> $queries
     * @param ?array<float> $column
     * @param ?string $id
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        int $topK,
        mixed $filter,
        ?string $namespace = null,
        ?bool $includeValues = null,
        ?bool $includeMetadata = null,
        ?array $queries = null,
        ?array $column = null,
        ?string $id = null,
        ?IndexedData $indexedData = null,
    ) {
        $this->topK = $topK;
        $this->filter = $filter;
        $this->namespace = $namespace;
        $this->includeValues = $includeValues;
        $this->includeMetadata = $includeMetadata;
        $this->queries = $queries;
        $this->column = $column;
        $this->id = $id;
        $this->indexedData = $indexedData;
    }
}
