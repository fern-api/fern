<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\Types\ProblemDescription;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;

class ProblemInfoV2 extends SerializableType
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
     * @var array<Language> $supportedLanguages
     */
    #[JsonProperty('supportedLanguages'), ArrayType([Language::class])]
    public array $supportedLanguages;

    /**
     * @var mixed $customFiles
     */
    #[JsonProperty('customFiles')]
    public mixed $customFiles;

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
     *   supportedLanguages: array<Language>,
     *   customFiles: mixed,
     *   generatedFiles: GeneratedFiles,
     *   customTestCaseTemplates: array<TestCaseTemplate>,
     *   testcases: array<TestCaseV2>,
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
}
