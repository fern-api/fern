<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\FileInfo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ProblemFiles extends JsonSerializableType
{
    /**
     * @var FileInfo $solutionFile
     */
    #[JsonProperty('solutionFile')]
    public FileInfo $solutionFile;

    /**
     * @var array<FileInfo> $readOnlyFiles
     */
    #[JsonProperty('readOnlyFiles'), ArrayType([FileInfo::class])]
    public array $readOnlyFiles;

    /**
     * @param array{
     *   solutionFile: FileInfo,
     *   readOnlyFiles: array<FileInfo>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->solutionFile = $values['solutionFile'];$this->readOnlyFiles = $values['readOnlyFiles'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
