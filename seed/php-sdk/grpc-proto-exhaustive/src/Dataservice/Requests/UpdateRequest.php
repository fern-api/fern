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
     * @var ?array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
    public ?array $values;

    /**
     * @var mixed $setMetadata
     */
    #[JsonProperty("setMetadata")]
    public mixed $setMetadata;

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
     * @param array{
     *   id: string,
     *   values?: ?array<float>,
     *   setMetadata: mixed,
     *   namespace?: ?string,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->values = $values['values'] ?? null;
        $this->setMetadata = $values['setMetadata'];
        $this->namespace = $values['namespace'] ?? null;
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
