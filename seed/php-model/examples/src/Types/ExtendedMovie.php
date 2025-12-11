<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Traits\Movie;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ExtendedMovie extends JsonSerializableType
{
    use Movie;

    /**
     * @var array<string> $cast
     */
    #[JsonProperty('cast'), ArrayType(['string'])]
    public array $cast;

    /**
     * @param array{
     *   id: string,
     *   title: string,
     *   from: string,
     *   rating: float,
     *   type: 'movie',
     *   tag: string,
     *   metadata: array<string, mixed>,
     *   revenue: int,
     *   cast: array<string>,
     *   prequel?: ?string,
     *   book?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->prequel = $values['prequel'] ?? null;$this->title = $values['title'];$this->from = $values['from'];$this->rating = $values['rating'];$this->type = $values['type'];$this->tag = $values['tag'];$this->book = $values['book'] ?? null;$this->metadata = $values['metadata'];$this->revenue = $values['revenue'];$this->cast = $values['cast'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
