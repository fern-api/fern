<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\FileInfo;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class WorkspaceFiles extends SerializableType
{
    /**
     * @var FileInfo $mainFile
     */
    #[JsonProperty("mainFile")]
    public FileInfo $mainFile;

    /**
     * @var array<FileInfo> $readOnlyFiles
     */
    #[JsonProperty("readOnlyFiles"), ArrayType([FileInfo::class])]
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
