<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GeneratedFiles extends SerializableType
{
    /**
     * @var array<Language, Files> $generatedTestCaseFiles
     */
    #[JsonProperty("generatedTestCaseFiles"), ArrayType([Language::class => Files::class])]
    public array $generatedTestCaseFiles;

    /**
     * @var array<Language, Files> $generatedTemplateFiles
     */
    #[JsonProperty("generatedTemplateFiles"), ArrayType([Language::class => Files::class])]
    public array $generatedTemplateFiles;

    /**
     * @var array<Language, Files> $other
     */
    #[JsonProperty("other"), ArrayType([Language::class => Files::class])]
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
