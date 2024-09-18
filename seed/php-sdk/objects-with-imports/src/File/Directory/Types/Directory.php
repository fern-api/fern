<?php

namespace Seed\File\Directory\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\File\Types\File;
use Seed\Core\ArrayType;

class Directory extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var ?array<File> $files
     */
    #[JsonProperty("files"), ArrayType([File::class])]
    public ?array $files;

    /**
     * @var ?array<Directory> $directories
     */
    #[JsonProperty("directories"), ArrayType([Directory::class])]
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
