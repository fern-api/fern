<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\File;
use Seed\Types\Directory;

class Directory extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("files"), ArrayType([File::class])]
    /**
     * @var ?array<File> $files
     */
    public ?array $files;

    #[JsonProperty("directories"), ArrayType([Directory::class])]
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
