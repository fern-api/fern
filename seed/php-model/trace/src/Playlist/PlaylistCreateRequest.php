<?php

namespace Seed\Playlist;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class PlaylistCreateRequest extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("problems"), ArrayType(["string"])]
    /**
     * @var array<string> $problems
     */
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
