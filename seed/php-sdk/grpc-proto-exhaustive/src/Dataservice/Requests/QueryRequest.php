<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Types\QueryColumn;
use Seed\Core\Types\ArrayType;
use Seed\Types\IndexedData;

class QueryRequest extends JsonSerializableType
{
    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var int $topK
     */
    #[JsonProperty('topK')]
    public int $topK;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $filter
     */
    #[JsonProperty('filter'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'], 'null')]
    public array|null $filter;

    /**
     * @var ?bool $includeValues
     */
    #[JsonProperty('includeValues')]
    public ?bool $includeValues;

    /**
     * @var ?bool $includeMetadata
     */
    #[JsonProperty('includeMetadata')]
    public ?bool $includeMetadata;

    /**
     * @var ?array<QueryColumn> $queries
     */
    #[JsonProperty('queries'), ArrayType([QueryColumn::class])]
    public ?array $queries;

    /**
     * @var ?array<float> $column
     */
    #[JsonProperty('column'), ArrayType(['float'])]
    public ?array $column;

    /**
     * @var ?string $id
     */
    #[JsonProperty('id')]
    public ?string $id;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty('indexedData')]
    public ?IndexedData $indexedData;

    /**
     * @param array{
     *   namespace?: ?string,
     *   topK: int,
     *   filter?: array<string, float|string|bool>|array<string, mixed>|null,
     *   includeValues?: ?bool,
     *   includeMetadata?: ?bool,
     *   queries?: ?array<QueryColumn>,
     *   column?: ?array<float>,
     *   id?: ?string,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->namespace = $values['namespace'] ?? null;
        $this->topK = $values['topK'];
        $this->filter = $values['filter'] ?? null;
        $this->includeValues = $values['includeValues'] ?? null;
        $this->includeMetadata = $values['includeMetadata'] ?? null;
        $this->queries = $values['queries'] ?? null;
        $this->column = $values['column'] ?? null;
        $this->id = $values['id'] ?? null;
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
