<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Commons\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WorkspaceStarterFilesResponse extends SerializableType
{
    /**
     * @var array<value-of<Language>, WorkspaceFiles> $files
     */
    #[JsonProperty('files'), ArrayType(["string" => WorkspaceFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<value-of<Language>, WorkspaceFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }
}
