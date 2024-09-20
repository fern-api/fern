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
     * @param array{
     *   title: string,
     *   rating: float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->title = $values['title'];
        $this->rating = $values['rating'];
    }
}
