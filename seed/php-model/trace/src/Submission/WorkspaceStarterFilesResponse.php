<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Commons\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceStarterFilesResponse extends SerializableType
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
    ) {
        $this->files = $values['files'];
    }
}
