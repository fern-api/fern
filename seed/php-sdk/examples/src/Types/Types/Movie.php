<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Movie extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $title
     */
    #[JsonProperty("title")]
    public string $title;

    /**
     * @var string $from
     */
    #[JsonProperty("from")]
    public string $from;

    /**
     * @var float $rating The rating scale is one to five stars
     */
    #[JsonProperty("rating")]
    public float $rating;

    /**
     * @var string $type
     */
    #[JsonProperty("type")]
    public string $type;

    /**
     * @var string $tag
     */
    #[JsonProperty("tag")]
    public string $tag;

    /**
     * @var array<string, mixed> $metadata
     */
    #[JsonProperty("metadata"), ArrayType(["string" => "mixed"])]
    public array $metadata;

    /**
     * @var int $revenue
     */
    #[JsonProperty("revenue")]
    public int $revenue;

    /**
     * @var ?string $prequel
     */
    #[JsonProperty("prequel")]
    public ?string $prequel;

    /**
     * @var ?string $book
     */
    #[JsonProperty("book")]
    public ?string $book;

    /**
     * @param string $id
     * @param string $title
     * @param string $from
     * @param float $rating The rating scale is one to five stars
     * @param string $type
     * @param string $tag
     * @param array<string, mixed> $metadata
     * @param int $revenue
     * @param ?string $prequel
     * @param ?string $book
     */
    public function __construct(
        string $id,
        string $title,
        string $from,
        float $rating,
        string $type,
        string $tag,
        array $metadata,
        int $revenue,
        ?string $prequel = null,
        ?string $book = null,
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->from = $from;
        $this->rating = $rating;
        $this->type = $type;
        $this->tag = $tag;
        $this->metadata = $metadata;
        $this->revenue = $revenue;
        $this->prequel = $prequel;
        $this->book = $book;
    }
}
