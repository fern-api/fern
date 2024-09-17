<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\V2\Problem\Types\Files;

class GeneratedFiles extends SerializableType
{
    #[JsonProperty("generatedTestCaseFiles"), ArrayType([Language => Files])]
    /**
     * @var array<Language, Files> $generatedTestCaseFiles
     */
    public array $generatedTestCaseFiles;

    #[JsonProperty("generatedTemplateFiles"), ArrayType([Language => Files])]
    /**
     * @var array<Language, Files> $generatedTemplateFiles
     */
    public array $generatedTemplateFiles;

    #[JsonProperty("other"), ArrayType([Language => Files])]
    /**
     * @var array<Language, Files> $other
     */
    public array $other;

    /**
     * @param array<Language, Files> $generatedTestCaseFiles
     * @param array<Language, Files> $generatedTemplateFiles
     * @param array<Language, Files> $other
     */
    public function __construct(
        array $generatedTestCaseFiles,
        array $generatedTemplateFiles,
        array $other,
    ) {
        $this->generatedTestCaseFiles = $generatedTestCaseFiles;
        $this->generatedTemplateFiles = $generatedTemplateFiles;
        $this->other = $other;
    }
}
