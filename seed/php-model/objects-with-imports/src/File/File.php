<?php

namespace Seed\File;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class File extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $contents
     */
    #[JsonProperty('contents')]
    public string $contents;

    /**
     * @var value-of<FileInfo> $info
     */
    #[JsonProperty('info')]
    public string $info;

    /**
     * @param array{
     *   name: string,
     *   contents: string,
     *   info: value-of<FileInfo>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->contents = $values['contents'];
        $this->info = $values['info'];
    }
}
