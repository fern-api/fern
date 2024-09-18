<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Commons\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetDefaultStarterFilesResponse extends SerializableType
{
    /**
     * @var array<Language, ProblemFiles> $files
     */
    #[JsonProperty("files"), ArrayType([Language::class => ProblemFiles::class])]
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
