<?php

namespace Seed\File\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class File extends JsonSerializableType
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
    )
    {
        $this->name = $values['name'];$this->contents = $values['contents'];$this->info = $values['info'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
