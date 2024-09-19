<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FileInfo extends SerializableType
{
    /**
     * @var string $filename
     */
    #[JsonProperty("filename")]
    public string $filename;

    /**
     * @var string $contents
     */
    #[JsonProperty("contents")]
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
