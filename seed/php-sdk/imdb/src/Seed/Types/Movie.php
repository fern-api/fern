<?php

namespace Seed\Seed\Types;

class Movie
{
    /**
     * @var string $id
     */
    public readonly string $id;

    /**
     * @var string $title
     */
    public readonly string $title;

    /**
     * @var float $rating The rating scale is one to five stars
     */
    public readonly float $rating;

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
