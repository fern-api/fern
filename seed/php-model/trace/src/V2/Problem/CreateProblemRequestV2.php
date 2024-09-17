<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\ProblemDescription;
use Seed\Core\ArrayType;
use Seed\V2\Problem\TestCaseTemplate;
use Seed\V2\Problem\TestCaseV2;
use Seed\Commons\Language;

class CreateProblemRequestV2 extends SerializableType
{
    #[JsonProperty("problemName")]
    /**
     * @var string $problemName
     */
    public string $problemName;

    #[JsonProperty("problemDescription")]
    /**
     * @var ProblemDescription $problemDescription
     */
    public ProblemDescription $problemDescription;

    #[JsonProperty("customFiles")]
    /**
     * @var mixed $customFiles
     */
    public mixed $customFiles;

    #[JsonProperty("customTestCaseTemplates"), ArrayType([TestCaseTemplate::class])]
    /**
     * @var array<TestCaseTemplate> $customTestCaseTemplates
     */
    public array $customTestCaseTemplates;

    #[JsonProperty("testcases"), ArrayType([TestCaseV2::class])]
    /**
     * @var array<TestCaseV2> $testcases
     */
    public array $testcases;

    #[JsonProperty("supportedLanguages"), ArrayType([Language::class])]
    /**
     * @var array<Language> $supportedLanguages
     */
    public array $supportedLanguages;

    #[JsonProperty("isPublic")]
    /**
     * @var bool $isPublic
     */
    public bool $isPublic;

    /**
     * @param string $problemName
     * @param ProblemDescription $problemDescription
     * @param mixed $customFiles
     * @param array<TestCaseTemplate> $customTestCaseTemplates
     * @param array<TestCaseV2> $testcases
     * @param array<Language> $supportedLanguages
     * @param bool $isPublic
     */
    public function __construct(
        string $problemName,
        ProblemDescription $problemDescription,
        mixed $customFiles,
        array $customTestCaseTemplates,
        array $testcases,
        array $supportedLanguages,
        bool $isPublic,
    ) {
        $this->problemName = $problemName;
        $this->problemDescription = $problemDescription;
        $this->customFiles = $customFiles;
        $this->customTestCaseTemplates = $customTestCaseTemplates;
        $this->testcases = $testcases;
        $this->supportedLanguages = $supportedLanguages;
        $this->isPublic = $isPublic;
    }
}
