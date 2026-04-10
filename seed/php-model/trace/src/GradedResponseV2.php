<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class GradedResponseV2 extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var array<string, (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * )> $testCases
     */
    #[JsonProperty('testCases'), ArrayType(['string' => new Union(TestCaseGradeZero::class, TestCaseGradeOne::class)])]
    public array $testCases;

    /**
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * )>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->testCases = $values['testCases'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
