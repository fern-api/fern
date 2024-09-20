<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class QueryColumn extends SerializableType
{
    /**
     * @var array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
    public array $values;

    /**
     * @var ?int $topK
     */
    #[JsonProperty("topK")]
    public ?int $topK;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

    /**
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty("indexedData")]
    public ?IndexedData $indexedData;

    /**
     * @param array{
     *   values: array<float>,
     *   topK?: ?int,
     *   namespace?: ?string,
     *   filter: mixed,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->values = $values['values'];
        $this->topK = $values['topK'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->filter = $values['filter'];
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
