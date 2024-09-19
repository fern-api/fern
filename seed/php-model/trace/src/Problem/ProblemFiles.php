<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Commons\FileInfo;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class ProblemFiles extends SerializableType
{
    /**
     * @var FileInfo $solutionFile
     */
    #[JsonProperty("solutionFile")]
    public FileInfo $solutionFile;

    /**
     * @var array<FileInfo> $readOnlyFiles
     */
    #[JsonProperty("readOnlyFiles"), ArrayType([FileInfo::class])]
    public array $readOnlyFiles;

    /**
     * @param FileInfo $solutionFile
     * @param array<FileInfo> $readOnlyFiles
     */
    public function __construct(
        FileInfo $solutionFile,
        array $readOnlyFiles,
    ) {
        $this->solutionFile = $solutionFile;
        $this->readOnlyFiles = $readOnlyFiles;
    }
}
