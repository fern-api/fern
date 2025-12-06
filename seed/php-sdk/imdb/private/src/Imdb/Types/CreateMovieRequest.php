<?php

namespace Seed\Imdb\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateMovieRequest extends JsonSerializableType
{
    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    private string $title;

    /**
     * @var float $rating
     */
    #[JsonProperty('rating')]
    private float $rating;

    /**
     * @param array{
     *   title: string,
     *   rating: float,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->title = $values['title'];$this->rating = $values['rating'];
    }

    /**
     * @return string
     */
    public function getTitle(): string {
        return $this->title;}

    /**
     * @param string $value
     */
    public function setTitle(string $value): self {
        $this->title = $value;return $this;}

    /**
     * @return float
     */
    public function getRating(): float {
        return $this->rating;}

    /**
     * @param float $value
     */
    public function setRating(float $value): self {
        $this->rating = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
