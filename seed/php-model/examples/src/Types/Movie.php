<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Movie extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("title")]
    /**
     * @var string $title
     */
    public string $title;

    #[JsonProperty("from")]
    /**
     * @var string $from
     */
    public string $from;

    #[JsonProperty("rating")]
    /**
     * @var float $rating The rating scale is one to five stars
     */
    public float $rating;

    #[JsonProperty("type")]
    /**
     * @var string $type
     */
    public string $type;

    #[JsonProperty("tag")]
    /**
     * @var string $tag
     */
    public string $tag;

    #[JsonProperty("metadata"), ArrayType(["string" => "mixed"])]
    /**
     * @var array<string, mixed> $metadata
     */
    public array $metadata;

    #[JsonProperty("revenue")]
    /**
     * @var int $revenue
     */
    public int $revenue;

    #[JsonProperty("prequel")]
    /**
     * @var ?string $prequel
     */
    public ?string $prequel;

    #[JsonProperty("book")]
    /**
     * @var ?string $book
     */
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
