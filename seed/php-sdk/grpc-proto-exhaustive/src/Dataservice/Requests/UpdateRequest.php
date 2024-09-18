<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\IndexedData;

class UpdateRequest
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var mixed $setMetadata
     */
    #[JsonProperty("setMetadata")]
    public mixed $setMetadata;

    /**
     * @var ?array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
    public ?array $values;

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
     * @param string $id
     * @param mixed $setMetadata
     * @param ?array<float> $values
     * @param ?string $namespace
     * @param ?IndexedData $indexedData
     */
    public function __construct(
        string $id,
        mixed $setMetadata,
        ?array $values = null,
        ?string $namespace = null,
        ?IndexedData $indexedData = null,
    ) {
        $this->id = $id;
        $this->setMetadata = $setMetadata;
        $this->values = $values;
        $this->namespace = $namespace;
        $this->indexedData = $indexedData;
    }
}
