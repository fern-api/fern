<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Document;
use Seed\Core\Json\JsonProperty;

class SearchResultTwo extends JsonSerializableType
{
    use Document;

    /**
     * @var value-of<SearchResultTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   id: string,
     *   title: string,
     *   content: string,
     *   type: value-of<SearchResultTwoType>,
     *   author?: ?string,
     *   tags?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->title = $values['title'];
        $this->content = $values['content'];
        $this->author = $values['author'] ?? null;
        $this->tags = $values['tags'] ?? null;
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
