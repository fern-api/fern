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
     * @param array{
     *   filename: string,
     *   directory: string,
     *   contents: string,
     *   editable: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->filename = $values['filename'];
        $this->directory = $values['directory'];
        $this->contents = $values['contents'];
        $this->editable = $values['editable'];
    }
}
