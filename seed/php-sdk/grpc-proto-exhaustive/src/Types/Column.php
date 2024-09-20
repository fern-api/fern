<?php

namespace Seed\Types;

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
     * @param array{
     *   id: string,
     *   values: array<float>,
     *   metadata: mixed,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->values = $values['values'];
        $this->metadata = $values['metadata'];
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
