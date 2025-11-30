<?php

namespace Seed\Playlist;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UpdatePlaylistRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<string> $problems The problems that make up the playlist.
     */
    #[JsonProperty('problems'), ArrayType(['string'])]
    public array $problems;

    /**
     * @param array{
     *   name: string,
     *   problems: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->problems = $values['problems'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
