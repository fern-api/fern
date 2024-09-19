<?php

namespace Seed\Imdb\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateMovieRequest extends SerializableType
{
    /**
     * @var string $title
     */
    #[JsonProperty("title")]
    public string $title;

    /**
     * @var float $rating
     */
    #[JsonProperty("rating")]
    public float $rating;

    /**
     * @param string $title
     * @param float $rating
     */
    public function __construct(
        string $title,
        float $rating,
    ) {
        $this->title = $title;
        $this->rating = $rating;
    }
}
