<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Commons\Types\Language;
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
