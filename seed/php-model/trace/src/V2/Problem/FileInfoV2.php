<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FileInfoV2 extends SerializableType
{
    #[JsonProperty("filename")]
    /**
     * @var string $filename
     */
    public string $filename;

    #[JsonProperty("directory")]
    /**
     * @var string $directory
     */
    public string $directory;

    #[JsonProperty("contents")]
    /**
     * @var string $contents
     */
    public string $contents;

    #[JsonProperty("editable")]
    /**
     * @var bool $editable
     */
    public bool $editable;

    /**
     * @param string $filename
     * @param string $directory
     * @param string $contents
     * @param bool $editable
     */
    public function __construct(
        string $filename,
        string $directory,
        string $contents,
        bool $editable,
    ) {
        $this->filename = $filename;
        $this->directory = $directory;
        $this->contents = $contents;
        $this->editable = $editable;
    }
}
