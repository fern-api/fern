<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Problem\ProblemDescription;
use Seed\Commons\Language;
use Seed\Core\Types\ArrayType;

class ProblemInfoV2 extends JsonSerializableType
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
     * @var CustomFiles $customFiles
     */
    #[JsonProperty('customFiles')]
    public CustomFiles $customFiles;

    /**
     * @var GeneratedFiles $generatedFiles
     */
    #[JsonProperty('generatedFiles')]
    public GeneratedFiles $generatedFiles;

    /**
     * @var array<TestCaseTemplate> $customTestCaseTemplates
     */
    #[JsonProperty('customTestCaseTemplates'), ArrayType([TestCaseTemplate::class])]
    public array $customTestCaseTemplates;

    /**
     * @var array<TestCaseV2> $testcases
     */
    #[JsonProperty('testcases'), ArrayType([TestCaseV2::class])]
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
     *   customFiles: CustomFiles,
     *   generatedFiles: GeneratedFiles,
     *   customTestCaseTemplates: array<TestCaseTemplate>,
     *   testcases: array<TestCaseV2>,
     *   isPublic: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemId = $values['problemId'];$this->problemDescription = $values['problemDescription'];$this->problemName = $values['problemName'];$this->problemVersion = $values['problemVersion'];$this->supportedLanguages = $values['supportedLanguages'];$this->customFiles = $values['customFiles'];$this->generatedFiles = $values['generatedFiles'];$this->customTestCaseTemplates = $values['customTestCaseTemplates'];$this->testcases = $values['testcases'];$this->isPublic = $values['isPublic'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
