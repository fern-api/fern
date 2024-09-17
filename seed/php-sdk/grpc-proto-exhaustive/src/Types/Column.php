<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\IndexedData;

class Column extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("values"), ArrayType(["float"])]
    /**
     * @var array<float> $values
     */
    public array $values;

    #[JsonProperty("metadata")]
    /**
     * @var mixed $metadata
     */
    public mixed $metadata;

    #[JsonProperty("indexedData")]
    /**
     * @var ?IndexedData $indexedData
     */
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
