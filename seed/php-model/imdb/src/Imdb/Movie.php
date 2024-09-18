<?php

namespace Seed\Imdb;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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

    #[JsonProperty("rating")]
    /**
     * @var float $rating The rating scale is one to five stars
     */
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
