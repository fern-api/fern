<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceStarterFilesResponse extends JsonSerializableType
{
    /**
     * @var array<string, WorkspaceFiles> $files
     */
    #[JsonProperty('files'), ArrayType(['string' => WorkspaceFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<string, WorkspaceFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
