<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class QueryColumn extends SerializableType
{
    /**
     * @var array<float> $values
     */
    #[JsonProperty('values'), ArrayType(['float'])]
    public array $values;

    /**
     * @var ?int $topK
     */
    #[JsonProperty('topK')]
    public ?int $topK;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $filter
     */
    #[JsonProperty('filter'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'])]
    public array|null $filter;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty('indexedData')]
    public ?IndexedData $indexedData;

    /**
     * @param array{
     *   values: array<float>,
     *   topK?: ?int,
     *   namespace?: ?string,
     *   filter?: array<string, float|string|bool>|array<string, mixed>|null,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->values = $values['values'];
        $this->topK = $values['topK'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->filter = $values['filter'] ?? null;
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
