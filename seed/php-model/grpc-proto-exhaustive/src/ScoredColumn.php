<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\IndexedData;

class ScoredColumn extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("score")]
    /**
     * @var ?float $score
     */
    public ?float $score;

    #[JsonProperty("values"), ArrayType(["float"])]
    /**
     * @var ?array<float> $values
     */
    public ?array $values;

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
     * @param ?float $score
     * @param ?array<float> $values
     * @param mixed $metadata
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        string $id,
        ?float $score = null,
        ?array $values = null,
        mixed $metadata,
        ?IndexedData $indexedData = null,
    ) {
        $this->id = $id;
        $this->score = $score;
        $this->values = $values;
        $this->metadata = $metadata;
        $this->indexedData = $indexedData;
    }
}
