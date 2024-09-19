<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FileInfoV2 extends SerializableType
{
    /**
     * @var string $filename
     */
    #[JsonProperty("filename")]
    public string $filename;

    /**
     * @var string $directory
     */
    #[JsonProperty("directory")]
    public string $directory;

    /**
     * @var string $contents
     */
    #[JsonProperty("contents")]
    public string $contents;

    /**
     * @var bool $editable
     */
    #[JsonProperty("editable")]
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
