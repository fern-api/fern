<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class FileDirectory extends JsonSerializableType
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
     * @var ?array<FileDirectory> $directories
     */
    #[JsonProperty('directories'), ArrayType([FileDirectory::class])]
    public ?array $directories;

    /**
     * @param array{
     *   name: string,
     *   files?: ?array<File>,
     *   directories?: ?array<FileDirectory>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->files = $values['files'] ?? null;
        $this->directories = $values['directories'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
