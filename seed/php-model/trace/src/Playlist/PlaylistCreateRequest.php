<?php

namespace Seed\Playlist;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class PlaylistCreateRequest extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var array<string> $problems
     */
    #[JsonProperty("problems"), ArrayType(["string"])]
    public array $problems;

    /**
     * @param string $name
     * @param array<string> $problems
     */
    public function __construct(
        string $name,
        array $problems,
    ) {
        $this->name = $name;
        $this->problems = $problems;
    }
}
