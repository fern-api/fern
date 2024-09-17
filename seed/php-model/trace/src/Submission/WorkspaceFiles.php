<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\FileInfo;
use Seed\Core\ArrayType;

class WorkspaceFiles extends SerializableType
{
    #[JsonProperty("mainFile")]
    /**
     * @var FileInfo $mainFile
     */
    public FileInfo $mainFile;

    #[JsonProperty("readOnlyFiles"), ArrayType([FileInfo])]
    /**
     * @var array<FileInfo> $readOnlyFiles
     */
    public array $readOnlyFiles;

    /**
     * @param FileInfo $mainFile
     * @param array<FileInfo> $readOnlyFiles
     */
    public function __construct(
        FileInfo $mainFile,
        array $readOnlyFiles,
    ) {
        $this->mainFile = $mainFile;
        $this->readOnlyFiles = $readOnlyFiles;
    }
}
