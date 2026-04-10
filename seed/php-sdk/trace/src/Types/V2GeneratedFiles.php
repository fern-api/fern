<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2GeneratedFiles extends JsonSerializableType
{
    /**
     * @var array<string, V2Files> $generatedTestCaseFiles
     */
    #[JsonProperty('generatedTestCaseFiles'), ArrayType(['string' => V2Files::class])]
    public array $generatedTestCaseFiles;

    /**
     * @var array<string, V2Files> $generatedTemplateFiles
     */
    #[JsonProperty('generatedTemplateFiles'), ArrayType(['string' => V2Files::class])]
    public array $generatedTemplateFiles;

    /**
     * @var array<string, V2Files> $other
     */
    #[JsonProperty('other'), ArrayType(['string' => V2Files::class])]
    public array $other;

    /**
     * @param array{
     *   generatedTestCaseFiles: array<string, V2Files>,
     *   generatedTemplateFiles: array<string, V2Files>,
     *   other: array<string, V2Files>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->generatedTestCaseFiles = $values['generatedTestCaseFiles'];
        $this->generatedTemplateFiles = $values['generatedTemplateFiles'];
        $this->other = $values['other'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
