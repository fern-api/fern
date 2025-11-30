<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\Types\ArrayType;
use Seed\Commons\VariableType;
use Seed\Commons\TestCaseWithExpectedResult;

class ProblemInfo extends JsonSerializableType
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
     * @var array<value-of<Language>, ProblemFiles> $files
     */
    #[JsonProperty('files'), ArrayType(['string' => ProblemFiles::class])]
    public array $files;

    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    #[JsonProperty('inputParams'), ArrayType([VariableTypeAndName::class])]
    public array $inputParams;

    /**
     * @var VariableType $outputType
     */
    #[JsonProperty('outputType')]
    public VariableType $outputType;

    /**
     * @var array<TestCaseWithExpectedResult> $testcases
     */
    #[JsonProperty('testcases'), ArrayType([TestCaseWithExpectedResult::class])]
    public array $testcases;

    /**
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @var bool $supportsCustomTestCases
     */
    #[JsonProperty('supportsCustomTestCases')]
    public bool $supportsCustomTestCases;

    /**
     * @param array{
     *   problemId: string,
     *   problemDescription: ProblemDescription,
     *   problemName: string,
     *   problemVersion: int,
     *   files: array<value-of<Language>, ProblemFiles>,
     *   inputParams: array<VariableTypeAndName>,
     *   outputType: VariableType,
     *   testcases: array<TestCaseWithExpectedResult>,
     *   methodName: string,
     *   supportsCustomTestCases: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemId = $values['problemId'];$this->problemDescription = $values['problemDescription'];$this->problemName = $values['problemName'];$this->problemVersion = $values['problemVersion'];$this->files = $values['files'];$this->inputParams = $values['inputParams'];$this->outputType = $values['outputType'];$this->testcases = $values['testcases'];$this->methodName = $values['methodName'];$this->supportsCustomTestCases = $values['supportsCustomTestCases'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
