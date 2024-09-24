<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GeneratedFiles extends SerializableType
{
    /**
     * @var array<value-of<Language>, Files> $generatedTestCaseFiles
     */
    #[JsonProperty('generatedTestCaseFiles'), ArrayType(["string" => Files::class])]
    public array $generatedTestCaseFiles;

    /**
     * @var array<value-of<Language>, Files> $generatedTemplateFiles
     */
    #[JsonProperty('generatedTemplateFiles'), ArrayType(["string" => Files::class])]
    public array $generatedTemplateFiles;

    /**
     * @var array<value-of<Language>, Files> $other
     */
    #[JsonProperty('other'), ArrayType(["string" => Files::class])]
    public array $other;

    /**
     * @param array{
     *   generatedTestCaseFiles: array<value-of<Language>, Files>,
     *   generatedTemplateFiles: array<value-of<Language>, Files>,
     *   other: array<value-of<Language>, Files>,
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
