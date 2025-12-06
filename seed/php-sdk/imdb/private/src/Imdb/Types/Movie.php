<?php

namespace Seed\Imdb\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Movie extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    private string $id;

    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    private string $title;

    /**
     * @var float $rating The rating scale is one to five stars
     */
    #[JsonProperty('rating')]
    private float $rating;

    /**
     * @param array{
     *   id: string,
     *   title: string,
     *   rating: float,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->title = $values['title'];$this->rating = $values['rating'];
    }

    /**
     * @return string
     */
    public function getId(): string {
        return $this->id;}

    /**
     * @param string $value
     */
    public function setId(string $value): self {
        $this->id = $value;return $this;}

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
