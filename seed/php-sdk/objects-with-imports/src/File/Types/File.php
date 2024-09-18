<?php

namespace Seed\File\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\File\Types\FileInfo;

class File extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("contents")]
    /**
     * @var string $contents
     */
    public string $contents;

    #[JsonProperty("info")]
    /**
     * @var FileInfo $info
     */
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
