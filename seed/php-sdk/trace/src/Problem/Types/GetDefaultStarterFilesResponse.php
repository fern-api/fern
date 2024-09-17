<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\Problem\Types\ProblemFiles;

class GetDefaultStarterFilesResponse extends SerializableType
{
    #[JsonProperty("files"), ArrayType([Language => ProblemFiles])]
    /**
     * @var array<Language, ProblemFiles> $files
     */
    public array $files;

    /**
     * @param array<Language, ProblemFiles> $files
     */
    public function __construct(
        array $files,
    ) {
        $this->files = $files;
    }
}
