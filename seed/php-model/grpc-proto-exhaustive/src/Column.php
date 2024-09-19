<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Column extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
    public array $values;

    /**
     * @var mixed $metadata
     */
    #[JsonProperty("metadata")]
    public mixed $metadata;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty("indexedData")]
    public ?IndexedData $indexedData;

    /**
     * @param string $id
     * @param array<float> $values
     * @param mixed $metadata
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        string $id,
        array $values,
        mixed $metadata,
        ?IndexedData $indexedData = null,
    ) {
        $this->id = $id;
        $this->values = $values;
        $this->metadata = $metadata;
        $this->indexedData = $indexedData;
    }
}
