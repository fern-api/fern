<?php

namespace Seed\Playlist\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UpdatePlaylistRequest extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var array<string> $problems The problems that make up the playlist.
     */
    #[JsonProperty("problems"), ArrayType(["string"])]
    public array $problems;

    /**
     * @param array{
     *   name: string,
     *   problems: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->problems = $values['problems'];
    }
}
