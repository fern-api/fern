<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class File extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var string $contents
     */
    #[JsonProperty("contents")]
    public string $contents;

    /**
     * @param string $name
     * @param string $contents
     */
    public function __construct(
        string $name,
        string $contents,
    ) {
        $this->name = $name;
        $this->contents = $contents;
    }
}
