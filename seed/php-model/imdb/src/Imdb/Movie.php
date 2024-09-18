<?php

namespace Seed\Imdb;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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
     * @var float $rating The rating scale is one to five stars
     */
    #[JsonProperty("rating")]
    public float $rating;

    /**
     * @param string $id
     * @param string $title
     * @param float $rating The rating scale is one to five stars
     */
    public function __construct(
        string $id,
        string $title,
        float $rating,
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->rating = $rating;
    }
}
