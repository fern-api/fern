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
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

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
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty("indexedData")]
    public ?IndexedData $indexedData;

    /**
     * @param array<float> $values
     * @param mixed $filter
     * @param ?int $topK
     * @param ?string $namespace
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        array $values,
        mixed $filter,
        ?int $topK = null,
        ?string $namespace = null,
        ?IndexedData $indexedData = null,
    ) {
        $this->values = $values;
        $this->filter = $filter;
        $this->topK = $topK;
        $this->namespace = $namespace;
        $this->indexedData = $indexedData;
    }
}
