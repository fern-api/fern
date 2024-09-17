<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\ProblemDescription;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\V2\Problem\GeneratedFiles;
use Seed\V2\Problem\TestCaseTemplate;
use Seed\V2\Problem\TestCaseV2;

class ProblemInfoV2 extends SerializableType
{
    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("problemDescription")]
    /**
     * @var ProblemDescription $problemDescription
     */
    public ProblemDescription $problemDescription;

    #[JsonProperty("problemName")]
    /**
     * @var string $problemName
     */
    public string $problemName;

    #[JsonProperty("problemVersion")]
    /**
     * @var int $problemVersion
     */
    public int $problemVersion;

    #[JsonProperty("supportedLanguages"), ArrayType([Language])]
    /**
     * @var array<Language> $supportedLanguages
     */
    public array $supportedLanguages;

    #[JsonProperty("customFiles")]
    /**
     * @var mixed $customFiles
     */
    public mixed $customFiles;

    #[JsonProperty("generatedFiles")]
    /**
     * @var GeneratedFiles $generatedFiles
     */
    public GeneratedFiles $generatedFiles;

    #[JsonProperty("customTestCaseTemplates"), ArrayType([TestCaseTemplate])]
    /**
     * @var array<TestCaseTemplate> $customTestCaseTemplates
     */
    public array $customTestCaseTemplates;

    #[JsonProperty("testcases"), ArrayType([TestCaseV2])]
    /**
     * @var array<TestCaseV2> $testcases
     */
    public array $testcases;

    #[JsonProperty("isPublic")]
    /**
     * @var bool $isPublic
     */
    public bool $isPublic;

    /**
     * @param string $problemId
     * @param ProblemDescription $problemDescription
     * @param string $problemName
     * @param int $problemVersion
     * @param array<Language> $supportedLanguages
     * @param mixed $customFiles
     * @param GeneratedFiles $generatedFiles
     * @param array<TestCaseTemplate> $customTestCaseTemplates
     * @param array<TestCaseV2> $testcases
     * @param bool $isPublic
     */
    public function __construct(
        string $problemId,
        ProblemDescription $problemDescription,
        string $problemName,
        int $problemVersion,
        array $supportedLanguages,
        mixed $customFiles,
        GeneratedFiles $generatedFiles,
        array $customTestCaseTemplates,
        array $testcases,
        bool $isPublic,
    ) {
        $this->problemId = $problemId;
        $this->problemDescription = $problemDescription;
        $this->problemName = $problemName;
        $this->problemVersion = $problemVersion;
        $this->supportedLanguages = $supportedLanguages;
        $this->customFiles = $customFiles;
        $this->generatedFiles = $generatedFiles;
        $this->customTestCaseTemplates = $customTestCaseTemplates;
        $this->testcases = $testcases;
        $this->isPublic = $isPublic;
    }
}
