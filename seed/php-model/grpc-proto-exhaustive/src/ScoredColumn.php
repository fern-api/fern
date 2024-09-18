<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ScoredColumn extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var mixed $metadata
     */
    #[JsonProperty("metadata")]
    public mixed $metadata;

    /**
     * @var ?float $score
     */
    #[JsonProperty("score")]
    public ?float $score;

    /**
     * @var ?array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
    public ?array $values;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty("indexedData")]
    public ?IndexedData $indexedData;

    /**
     * @param string $id
     * @param mixed $metadata
     * @param ?float $score
     * @param ?array<float> $values
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        string $id,
        mixed $metadata,
        ?float $score = null,
        ?array $values = null,
        ?IndexedData $indexedData = null,
    ) {
        $this->id = $id;
        $this->metadata = $metadata;
        $this->score = $score;
        $this->values = $values;
        $this->indexedData = $indexedData;
    }
}
