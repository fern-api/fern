<?php

namespace Seed\Types;

class CreateMovieRequest
{
    /**
     * @var string $title
     */
    public readonly string $title;

    /**
     * @var float $rating
     */
    public readonly float $rating;

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
