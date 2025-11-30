<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UploadDocumentRequest extends JsonSerializableType
{
    /**
     * @var ?string $author
     */
    #[JsonProperty('author')]
    public ?string $author;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?string $title
     */
    #[JsonProperty('title')]
    public ?string $title;

    /**
     * @param array{
     *   author?: ?string,
     *   tags?: ?array<string>,
     *   title?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->author = $values['author'] ?? null;$this->tags = $values['tags'] ?? null;$this->title = $values['title'] ?? null;
    }
}
