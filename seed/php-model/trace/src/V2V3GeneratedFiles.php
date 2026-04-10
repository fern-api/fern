<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3GeneratedFiles extends JsonSerializableType
{
    /**
     * @var array<string, V2V3Files> $generatedTestCaseFiles
     */
    #[JsonProperty('generatedTestCaseFiles'), ArrayType(['string' => V2V3Files::class])]
    public array $generatedTestCaseFiles;

    /**
     * @var array<string, V2V3Files> $generatedTemplateFiles
     */
    #[JsonProperty('generatedTemplateFiles'), ArrayType(['string' => V2V3Files::class])]
    public array $generatedTemplateFiles;

    /**
     * @var array<string, V2V3Files> $other
     */
    #[JsonProperty('other'), ArrayType(['string' => V2V3Files::class])]
    public array $other;

    /**
     * @param array{
     *   generatedTestCaseFiles: array<string, V2V3Files>,
     *   generatedTemplateFiles: array<string, V2V3Files>,
     *   other: array<string, V2V3Files>,
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
