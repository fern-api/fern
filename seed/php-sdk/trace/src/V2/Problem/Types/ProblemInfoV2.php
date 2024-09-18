<?php

namespace Seed\V2\Problem\Types;

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
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var ProblemDescription $problemDescription
     */
    #[JsonProperty("problemDescription")]
    public ProblemDescription $problemDescription;

    /**
     * @var string $problemName
     */
    #[JsonProperty("problemName")]
    public string $problemName;

    /**
     * @var int $problemVersion
     */
    #[JsonProperty("problemVersion")]
    public int $problemVersion;

    /**
     * @var array<Language> $supportedLanguages
     */
    #[JsonProperty("supportedLanguages"), ArrayType([Language::class])]
    public array $supportedLanguages;

    /**
     * @var mixed $customFiles
     */
    #[JsonProperty("customFiles")]
    public mixed $customFiles;

    /**
     * @var GeneratedFiles $generatedFiles
     */
    #[JsonProperty("generatedFiles")]
    public GeneratedFiles $generatedFiles;

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
     * @var bool $isPublic
     */
    #[JsonProperty("isPublic")]
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
