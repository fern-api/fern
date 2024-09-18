<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\ArrayType;
use Seed\Commons\TestCaseWithExpectedResult;

class CreateProblemRequest extends SerializableType
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
     * @param string $problemName
     * @param ProblemDescription $problemDescription
     * @param array<Language, ProblemFiles> $files
     * @param array<VariableTypeAndName> $inputParams
     * @param mixed $outputType
     * @param array<TestCaseWithExpectedResult> $testcases
     * @param string $methodName
     */
    public function __construct(
        string $problemName,
        ProblemDescription $problemDescription,
        array $files,
        array $inputParams,
        mixed $outputType,
        array $testcases,
        string $methodName,
    ) {
        $this->problemName = $problemName;
        $this->problemDescription = $problemDescription;
        $this->files = $files;
        $this->inputParams = $inputParams;
        $this->outputType = $outputType;
        $this->testcases = $testcases;
        $this->methodName = $methodName;
    }
}
