<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceStarterFilesResponse extends JsonSerializableType
{
    /**
     * @var array<value-of<Language>, WorkspaceFiles> $files
     */
    #[JsonProperty('files'), ArrayType(['string' => WorkspaceFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<value-of<Language>, WorkspaceFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->files = $values['files'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
