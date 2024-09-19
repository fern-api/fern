<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;
use Seed\Commons\Types\TestCaseWithExpectedResult;

class ProblemInfo extends SerializableType
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
     * @var array<Language, ProblemFiles> $files
     */
    #[JsonProperty("files"), ArrayType([Language::class => ProblemFiles::class])]
    public array $files;

    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    #[JsonProperty("inputParams"), ArrayType([VariableTypeAndName::class])]
    public array $inputParams;

    /**
     * @var mixed $outputType
     */
    #[JsonProperty("outputType")]
    public mixed $outputType;

    /**
     * @var array<TestCaseWithExpectedResult> $testcases
     */
    #[JsonProperty("testcases"), ArrayType([TestCaseWithExpectedResult::class])]
    public array $testcases;

    /**
     * @var string $methodName
     */
    #[JsonProperty("methodName")]
    public string $methodName;

    /**
     * @var bool $supportsCustomTestCases
     */
    #[JsonProperty("supportsCustomTestCases")]
    public bool $supportsCustomTestCases;

    /**
     * @param string $problemId
     * @param ProblemDescription $problemDescription
     * @param string $problemName
     * @param int $problemVersion
     * @param array<Language, ProblemFiles> $files
     * @param array<VariableTypeAndName> $inputParams
     * @param mixed $outputType
     * @param array<TestCaseWithExpectedResult> $testcases
     * @param string $methodName
     * @param bool $supportsCustomTestCases
     */
    public function __construct(
        string $problemId,
        ProblemDescription $problemDescription,
        string $problemName,
        int $problemVersion,
        array $files,
        array $inputParams,
        mixed $outputType,
        array $testcases,
        string $methodName,
        bool $supportsCustomTestCases,
    ) {
        $this->problemId = $problemId;
        $this->problemDescription = $problemDescription;
        $this->problemName = $problemName;
        $this->problemVersion = $problemVersion;
        $this->files = $files;
        $this->inputParams = $inputParams;
        $this->outputType = $outputType;
        $this->testcases = $testcases;
        $this->methodName = $methodName;
        $this->supportsCustomTestCases = $supportsCustomTestCases;
    }
}
