<?php

namespace Seed\Nullable;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class User extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?Metadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?Metadata $metadata;

    /**
     * @param array{
     *   name: string,
     *   tags?: ?array<string>,
     *   metadata?: ?Metadata,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->tags = $values['tags'] ?? null;
        $this->metadata = $values['metadata'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
