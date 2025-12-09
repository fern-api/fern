<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\Types\ArrayType;
use Seed\Commons\VariableType;
use Seed\Commons\TestCaseWithExpectedResult;

class CreateProblemRequest extends JsonSerializableType
{
    /**
     * @var string $problemName
     */
    #[JsonProperty('problemName')]
    public string $problemName;

    /**
     * @var ProblemDescription $problemDescription
     */
    #[JsonProperty('problemDescription')]
    public ProblemDescription $problemDescription;

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
     * @param array{
     *   problemName: string,
     *   problemDescription: ProblemDescription,
     *   files: array<value-of<Language>, ProblemFiles>,
     *   inputParams: array<VariableTypeAndName>,
     *   outputType: VariableType,
     *   testcases: array<TestCaseWithExpectedResult>,
     *   methodName: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemName = $values['problemName'];$this->problemDescription = $values['problemDescription'];$this->files = $values['files'];$this->inputParams = $values['inputParams'];$this->outputType = $values['outputType'];$this->testcases = $values['testcases'];$this->methodName = $values['methodName'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
