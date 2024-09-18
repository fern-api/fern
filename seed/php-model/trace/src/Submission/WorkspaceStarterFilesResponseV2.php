<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\V2\Problem\Files;

class WorkspaceStarterFilesResponseV2 extends SerializableType
{
    #[JsonProperty("filesByLanguage"), ArrayType([Language::class => Files::class])]
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
