<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\IndexedData;

class QueryColumn extends SerializableType
{
    #[JsonProperty("values"), ArrayType(["float"])]
    /**
     * @var array<float> $values
     */
    public array $values;

    #[JsonProperty("topK")]
    /**
     * @var ?int $topK
     */
    public ?int $topK;

    #[JsonProperty("namespace")]
    /**
     * @var ?string $namespace
     */
    public ?string $namespace;

    #[JsonProperty("filter")]
    /**
     * @var mixed $filter
     */
    public mixed $filter;

    #[JsonProperty("indexedData")]
    /**
     * @var ?IndexedData $indexedData
     */
    public ?IndexedData $indexedData;

    /**
     * @param array<float> $values
     * @param ?int $topK
     * @param ?string $namespace
     * @param mixed $filter
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        array $values,
        ?int $topK = null,
        ?string $namespace = null,
        mixed $filter,
        ?IndexedData $indexedData = null,
    ) {
        $this->values = $values;
        $this->topK = $topK;
        $this->namespace = $namespace;
        $this->filter = $filter;
        $this->indexedData = $indexedData;
    }
}
