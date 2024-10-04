<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;
use Seed\Types\IndexedData;

class UpdateRequest extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?array<float> $values
     */
    #[JsonProperty('values'), ArrayType(['float'])]
    public ?array $values;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $setMetadata
     */
    #[JsonProperty('setMetadata'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'], 'null')]
    public array|null $setMetadata;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var ?IndexedData $indexedData
     */
    #[JsonProperty('indexedData')]
    public ?IndexedData $indexedData;

    /**
     * @param array{
     *   id: string,
     *   values?: ?array<float>,
     *   setMetadata?: array<string, float|string|bool>|array<string, mixed>|null,
     *   namespace?: ?string,
     *   indexedData?: ?IndexedData,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->values = $values['values'] ?? null;
        $this->setMetadata = $values['setMetadata'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->indexedData = $values['indexedData'] ?? null;
    }
}
