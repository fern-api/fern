<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class V2ProblemInfoV2 extends JsonSerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var ProblemDescription $problemDescription
     */
    #[JsonProperty('problemDescription')]
    public ProblemDescription $problemDescription;

    /**
     * @var string $problemName
     */
    #[JsonProperty('problemName')]
    public string $problemName;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public int $problemVersion;

    /**
     * @var array<value-of<Language>> $supportedLanguages
     */
    #[JsonProperty('supportedLanguages'), ArrayType(['string'])]
    public array $supportedLanguages;

    /**
     * @var (
     *    V2CustomFilesZero
     *   |V2CustomFilesType
     * ) $customFiles
     */
    #[JsonProperty('customFiles'), Union(V2CustomFilesZero::class, V2CustomFilesType::class)]
    public V2CustomFilesZero|V2CustomFilesType $customFiles;

    /**
     * @var V2GeneratedFiles $generatedFiles
     */
    #[JsonProperty('generatedFiles')]
    public V2GeneratedFiles $generatedFiles;

    /**
     * @var array<V2TestCaseTemplate> $customTestCaseTemplates
     */
    #[JsonProperty('customTestCaseTemplates'), ArrayType([V2TestCaseTemplate::class])]
    public array $customTestCaseTemplates;

    /**
     * @var array<V2TestCaseV2> $testcases
     */
    #[JsonProperty('testcases'), ArrayType([V2TestCaseV2::class])]
    public array $testcases;

    /**
     * @var bool $isPublic
     */
    #[JsonProperty('isPublic')]
    public bool $isPublic;

    /**
     * @param array{
     *   problemId: string,
     *   problemDescription: ProblemDescription,
     *   problemName: string,
     *   problemVersion: int,
     *   supportedLanguages: array<value-of<Language>>,
     *   customFiles: (
     *    V2CustomFilesZero
     *   |V2CustomFilesType
     * ),
     *   generatedFiles: V2GeneratedFiles,
     *   customTestCaseTemplates: array<V2TestCaseTemplate>,
     *   testcases: array<V2TestCaseV2>,
     *   isPublic: bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->problemDescription = $values['problemDescription'];
        $this->problemName = $values['problemName'];
        $this->problemVersion = $values['problemVersion'];
        $this->supportedLanguages = $values['supportedLanguages'];
        $this->customFiles = $values['customFiles'];
        $this->generatedFiles = $values['generatedFiles'];
        $this->customTestCaseTemplates = $values['customTestCaseTemplates'];
        $this->testcases = $values['testcases'];
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
