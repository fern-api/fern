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
     * @param array{
     *   filename: string,
     *   contents: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->filename = $values['filename'];
        $this->contents = $values['contents'];
    }
}
