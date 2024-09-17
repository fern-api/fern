<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\FileInfo;
use Seed\Core\ArrayType;

class ProblemFiles extends SerializableType
{
    #[JsonProperty("solutionFile")]
    /**
     * @var FileInfo $solutionFile
     */
    public FileInfo $solutionFile;

    #[JsonProperty("readOnlyFiles"), ArrayType([FileInfo])]
    /**
     * @var array<FileInfo> $readOnlyFiles
     */
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
