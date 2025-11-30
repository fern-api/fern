<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Directory extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?array<File> $files
     */
    #[JsonProperty('files'), ArrayType([File::class])]
    public ?array $files;

    /**
     * @var ?array<Directory> $directories
     */
    #[JsonProperty('directories'), ArrayType([Directory::class])]
    public ?array $directories;

    /**
     * @param array{
     *   name: string,
     *   files?: ?array<File>,
     *   directories?: ?array<Directory>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->files = $values['files'] ?? null;$this->directories = $values['directories'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
