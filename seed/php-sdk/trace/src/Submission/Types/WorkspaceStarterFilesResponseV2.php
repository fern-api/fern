<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\V2\Problem\Types\Files;

class WorkspaceStarterFilesResponseV2 extends SerializableType
{
    #[JsonProperty("filesByLanguage"), ArrayType([Language => Files])]
    /**
     * @var array<Language, Files> $filesByLanguage
     */
    public array $filesByLanguage;

    /**
     * @param array<Language, Files> $filesByLanguage
     */
    public function __construct(
        array $filesByLanguage,
    ) {
        $this->filesByLanguage = $filesByLanguage;
    }
}
