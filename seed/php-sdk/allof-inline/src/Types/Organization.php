<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Organization extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?OrganizationMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?OrganizationMetadata $metadata;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   metadata?: ?OrganizationMetadata,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->metadata = $values['metadata'] ?? null;
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
