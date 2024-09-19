<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WorkspaceStarterFilesResponse extends SerializableType
{
    /**
     * @var array<Language, WorkspaceFiles> $files
     */
    #[JsonProperty("files"), ArrayType([Language::class => WorkspaceFiles::class])]
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
