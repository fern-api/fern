<?php

namespace Seed\File;

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
     * @var FileInfo $info
     */
    #[JsonProperty("info")]
    public FileInfo $info;

    /**
     * @param string $name
     * @param string $contents
     * @param FileInfo $info
     */
    public function __construct(
        string $name,
        string $contents,
        FileInfo $info,
    ) {
        $this->name = $name;
        $this->contents = $contents;
        $this->info = $info;
    }
}
