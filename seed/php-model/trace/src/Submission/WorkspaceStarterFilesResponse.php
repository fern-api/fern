<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\Submission\WorkspaceFiles;

class WorkspaceStarterFilesResponse extends SerializableType
{
    #[JsonProperty("files"), ArrayType([Language::class => WorkspaceFiles::class])]
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
