<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Problem\Types\ProblemDescription;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\Problem\Types\ProblemFiles;
use Seed\Problem\Types\VariableTypeAndName;
use Seed\Commons\Types\TestCaseWithExpectedResult;

class CreateProblemRequest extends SerializableType
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

    #[JsonProperty("files"), ArrayType([Language::class => ProblemFiles::class])]
    /**
     * @var array<Language, ProblemFiles> $files
     */
    public array $files;

    #[JsonProperty("inputParams"), ArrayType([VariableTypeAndName::class])]
    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    public array $inputParams;

    #[JsonProperty("outputType")]
    /**
     * @var mixed $outputType
     */
    public mixed $outputType;

    #[JsonProperty("testcases"), ArrayType([TestCaseWithExpectedResult::class])]
    /**
     * @var array<TestCaseWithExpectedResult> $testcases
     */
    public array $testcases;

    #[JsonProperty("methodName")]
    /**
     * @var string $methodName
     */
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
