<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Core\Types\ArrayType;

class V2CreateProblemRequestV2 extends JsonSerializableType
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
     *    V2CustomFilesZero
     *   |V2CustomFilesType
     * ) $customFiles
     */
    #[JsonProperty('customFiles'), Union(V2CustomFilesZero::class, V2CustomFilesType::class)]
    public V2CustomFilesZero|V2CustomFilesType $customFiles;

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
     *    V2CustomFilesZero
     *   |V2CustomFilesType
     * ),
     *   customTestCaseTemplates: array<V2TestCaseTemplate>,
     *   testcases: array<V2TestCaseV2>,
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
