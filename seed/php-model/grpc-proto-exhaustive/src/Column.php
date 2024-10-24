<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class Column extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var array<float> $values
     */
    #[JsonProperty('values'), ArrayType(['float'])]
    public array $values;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $metadata
     */
    #[JsonProperty('metadata'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'], 'null')]
    public array|null $metadata;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty('indexedData')]
    public ?IndexedData $indexedData;

    /**
     * @param array{
     *   id: string,
     *   values: array<float>,
     *   metadata?: array<string, float|string|bool>|array<string, mixed>|null,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->values = $values['values'];
        $this->metadata = $values['metadata'] ?? null;
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
