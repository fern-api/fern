<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Types\QueryColumn;
use Seed\Core\ArrayType;
use Seed\Types\IndexedData;

class QueryRequest
{
    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

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

}
