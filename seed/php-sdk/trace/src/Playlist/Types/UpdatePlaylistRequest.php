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
     * @param string $name
     * @param array<string> $problems The problems that make up the playlist.
     */
    public function __construct(
        string $name,
        array $problems,
    ) {
        $this->name = $name;
        $this->problems = $problems;
    }
}
