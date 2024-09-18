<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FileInfo extends SerializableType
{
    #[JsonProperty("filename")]
    /**
     * @var string $filename
     */
    public string $filename;

    #[JsonProperty("contents")]
    /**
     * @var string $contents
     */
    public string $contents;

    /**
     * @param string $filename
     * @param string $contents
     */
    public function __construct(
        string $filename,
        string $contents,
    ) {
        $this->filename = $filename;
        $this->contents = $contents;
    }
}
