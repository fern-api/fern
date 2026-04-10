<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Core\Types\ArrayType;

class V2V3CreateProblemRequestV2 extends JsonSerializableType
{
    /**
     * @var string $problemName
     */
    #[JsonProperty('problemName')]
    public string $problemName;

    /**
     * @var ProblemDescription $problemDescription
     */
    #[JsonProperty('problemDescription')]
    public ProblemDescription $problemDescription;

    /**
     * @var (
     *    V2V3CustomFilesZero
     *   |V2V3CustomFilesType
     * ) $customFiles
     */
    #[JsonProperty('customFiles'), Union(V2V3CustomFilesZero::class, V2V3CustomFilesType::class)]
    public V2V3CustomFilesZero|V2V3CustomFilesType $customFiles;

    /**
     * @var array<V2V3TestCaseTemplate> $customTestCaseTemplates
     */
    #[JsonProperty('customTestCaseTemplates'), ArrayType([V2V3TestCaseTemplate::class])]
    public array $customTestCaseTemplates;

    /**
     * @var array<V2V3TestCaseV2> $testcases
     */
    #[JsonProperty('testcases'), ArrayType([V2V3TestCaseV2::class])]
    public array $testcases;

    /**
     * @var array<value-of<Language>> $supportedLanguages
     */
    #[JsonProperty('supportedLanguages'), ArrayType(['string'])]
    public array $supportedLanguages;

    /**
     * @var bool $isPublic
     */
    #[JsonProperty('isPublic')]
    public bool $isPublic;

    /**
     * @param array{
     *   problemName: string,
     *   problemDescription: ProblemDescription,
     *   customFiles: (
     *    V2V3CustomFilesZero
     *   |V2V3CustomFilesType
     * ),
     *   customTestCaseTemplates: array<V2V3TestCaseTemplate>,
     *   testcases: array<V2V3TestCaseV2>,
     *   supportedLanguages: array<value-of<Language>>,
     *   isPublic: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemName = $values['problemName'];
        $this->problemDescription = $values['problemDescription'];
        $this->customFiles = $values['customFiles'];
        $this->customTestCaseTemplates = $values['customTestCaseTemplates'];
        $this->testcases = $values['testcases'];
        $this->supportedLanguages = $values['supportedLanguages'];
        $this->isPublic = $values['isPublic'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
