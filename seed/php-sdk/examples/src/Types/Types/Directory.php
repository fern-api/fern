<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\Types\File;
use Seed\Types\Types\Directory;

class Directory extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("files"), ArrayType([File])]
    /**
     * @var ?array<File> $files
     */
    public ?array $files;

    #[JsonProperty("directories"), ArrayType([Directory])]
    /**
     * @var ?array<Directory> $directories
     */
    public ?array $directories;

    /**
     * @param string $name
     * @param ?array<File> $files
     * @param ?array<Directory> $directories
     */
    public function __construct(
        string $name,
        ?array $files = null,
        ?array $directories = null,
    ) {
        $this->name = $name;
        $this->files = $files;
        $this->directories = $directories;
    }
}
