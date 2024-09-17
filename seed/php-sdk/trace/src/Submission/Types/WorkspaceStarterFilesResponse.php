<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\Submission\Types\WorkspaceFiles;

class WorkspaceStarterFilesResponse extends SerializableType
{
    #[JsonProperty("files"), ArrayType([Language => WorkspaceFiles])]
    /**
     * @var array<Language, WorkspaceFiles> $files
     */
    public array $files;

    /**
     * @param array<Language, WorkspaceFiles> $files
     */
    public function __construct(
        array $files,
    ) {
        $this->files = $files;
    }
}
