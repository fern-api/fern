<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Movie extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $prequel
     */
    #[JsonProperty('prequel')]
    public ?string $prequel;

    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    public string $title;

    /**
     * @var string $from
     */
    #[JsonProperty('from')]
    public string $from;

    /**
     * @var float $rating The rating scale is one to five stars
     */
    #[JsonProperty('rating')]
    public float $rating;

    /**
     * @var 'movie' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $tag
     */
    #[JsonProperty('tag')]
    public string $tag;

    /**
     * @var ?string $book
     */
    #[JsonProperty('book')]
    public ?string $book;

    /**
     * @var array<string, mixed> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    public array $metadata;

    /**
     * @var int $revenue
     */
    #[JsonProperty('revenue')]
    public int $revenue;

    /**
     * @param array{
     *   id: string,
     *   title: string,
     *   from: string,
     *   rating: float,
     *   type: 'movie',
     *   tag: string,
     *   metadata: array<string, mixed>,
     *   revenue: int,
     *   prequel?: ?string,
     *   book?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->prequel = $values['prequel'] ?? null;$this->title = $values['title'];$this->from = $values['from'];$this->rating = $values['rating'];$this->type = $values['type'];$this->tag = $values['tag'];$this->book = $values['book'] ?? null;$this->metadata = $values['metadata'];$this->revenue = $values['revenue'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
