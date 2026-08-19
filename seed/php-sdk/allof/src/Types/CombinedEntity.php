<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CombinedEntity extends JsonSerializableType
{
    /**
     * @var value-of<CombinedEntityStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @var string $id Unique identifier.
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $name Display name from Identifiable.
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $summary A short summary.
     */
    #[JsonProperty('summary')]
    public ?string $summary;

    /**
     * @param array{
     *   status: value-of<CombinedEntityStatus>,
     *   id: string,
     *   name?: ?string,
     *   summary?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->status = $values['status'];
        $this->id = $values['id'];
        $this->name = $values['name'] ?? null;
        $this->summary = $values['summary'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
