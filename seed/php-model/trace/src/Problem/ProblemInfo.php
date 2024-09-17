<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\ProblemDescription;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\Problem\ProblemFiles;
use Seed\Problem\VariableTypeAndName;
use Seed\Commons\TestCaseWithExpectedResult;

class ProblemInfo extends SerializableType
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

    #[JsonProperty("files"), ArrayType([Language => ProblemFiles])]
    /**
     * @var array<Language, ProblemFiles> $files
     */
    public array $files;

    #[JsonProperty("inputParams"), ArrayType([VariableTypeAndName])]
    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    public array $inputParams;

    #[JsonProperty("outputType")]
    /**
     * @var mixed $outputType
     */
    public mixed $outputType;

    #[JsonProperty("testcases"), ArrayType([TestCaseWithExpectedResult])]
    /**
     * @var array<TestCaseWithExpectedResult> $testcases
     */
    public array $testcases;

    #[JsonProperty("methodName")]
    /**
     * @var string $methodName
     */
    public string $methodName;

    #[JsonProperty("supportsCustomTestCases")]
    /**
     * @var bool $supportsCustomTestCases
     */
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
