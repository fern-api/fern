<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\Types\ProblemDescription;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;

class CreateProblemRequestV2 extends SerializableType
{
    /**
     * @var string $problemName
     */
    #[JsonProperty("problemName")]
    public string $problemName;

    /**
     * @var ProblemDescription $problemDescription
     */
    #[JsonProperty("problemDescription")]
    public ProblemDescription $problemDescription;

    /**
     * @var mixed $customFiles
     */
    #[JsonProperty("customFiles")]
    public mixed $customFiles;

    /**
     * @var array<TestCaseTemplate> $customTestCaseTemplates
     */
    #[JsonProperty("customTestCaseTemplates"), ArrayType([TestCaseTemplate::class])]
    public array $customTestCaseTemplates;

    /**
     * @var array<TestCaseV2> $testcases
     */
    #[JsonProperty("testcases"), ArrayType([TestCaseV2::class])]
    public array $testcases;

    /**
     * @var array<Language> $supportedLanguages
     */
    #[JsonProperty("supportedLanguages"), ArrayType([Language::class])]
    public array $supportedLanguages;

    /**
     * @var bool $isPublic
     */
    #[JsonProperty("isPublic")]
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
