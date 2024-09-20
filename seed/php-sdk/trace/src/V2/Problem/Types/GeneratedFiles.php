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
    #[JsonProperty('generatedTestCaseFiles'), ArrayType([Language::class => Files::class])]
    public array $generatedTestCaseFiles;

    /**
     * @var array<Language, Files> $generatedTemplateFiles
     */
    #[JsonProperty('generatedTemplateFiles'), ArrayType([Language::class => Files::class])]
    public array $generatedTemplateFiles;

    /**
     * @var array<Language, Files> $other
     */
    #[JsonProperty('other'), ArrayType([Language::class => Files::class])]
    public array $other;

    /**
     * @param array{
     *   generatedTestCaseFiles: array<Language, Files>,
     *   generatedTemplateFiles: array<Language, Files>,
     *   other: array<Language, Files>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->generatedTestCaseFiles = $values['generatedTestCaseFiles'];
        $this->generatedTemplateFiles = $values['generatedTemplateFiles'];
        $this->other = $values['other'];
    }
}
