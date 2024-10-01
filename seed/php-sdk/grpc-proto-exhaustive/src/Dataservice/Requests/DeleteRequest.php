<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class DeleteRequest extends SerializableType
{
    /**
     * @var ?array<string> $ids
     */
    #[JsonProperty('ids'), ArrayType(['string'])]
    public ?array $ids;

    /**
     * @var ?bool $deleteAll
     */
    #[JsonProperty('deleteAll')]
    public ?bool $deleteAll;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $filter
     */
    #[JsonProperty('filter'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'])]
    public array|null $filter;

    /**
     * @param array{
     *   ids?: ?array<string>,
     *   deleteAll?: ?bool,
     *   namespace?: ?string,
     *   filter?: array<string, float|string|bool>|array<string, mixed>|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->ids = $values['ids'] ?? null;
        $this->deleteAll = $values['deleteAll'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->filter = $values['filter'] ?? null;
    }
}
