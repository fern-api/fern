<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class QueryColumn extends JsonSerializableType
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
    #[JsonProperty('filter'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'], 'null')]
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
