<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class DocumentMetadata extends JsonSerializableType
{
    /**
     * @var ?string $author
     */
    #[JsonProperty('author')]
    public ?string $author;

    /**
     * @var ?int $id
     */
    #[JsonProperty('id')]
    public ?int $id;

    /**
     * @var ?array<mixed> $tags
     */
    #[JsonProperty('tags'), ArrayType(['mixed'])]
    public ?array $tags;

    /**
     * @var ?string $title
     */
    #[JsonProperty('title')]
    public ?string $title;

    /**
     * @param array{
     *   author?: ?string,
     *   id?: ?int,
     *   tags?: ?array<mixed>,
     *   title?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->author = $values['author'] ?? null;$this->id = $values['id'] ?? null;$this->tags = $values['tags'] ?? null;$this->title = $values['title'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
