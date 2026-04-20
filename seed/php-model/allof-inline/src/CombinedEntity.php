<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CombinedEntity extends JsonSerializableType
{
    /**
     * @var string $id Unique identifier.
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $name Display name from Describable.
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $summary A short summary.
     */
    #[JsonProperty('summary')]
    public ?string $summary;

    /**
     * @var value-of<CombinedEntityStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   id: string,
     *   status: value-of<CombinedEntityStatus>,
     *   name?: ?string,
     *   summary?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'] ?? null;
        $this->summary = $values['summary'] ?? null;
        $this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
