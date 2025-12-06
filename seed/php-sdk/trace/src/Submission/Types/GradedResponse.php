<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GradedResponse extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var array<string, TestCaseResultWithStdout> $testCases
     */
    #[JsonProperty('testCases'), ArrayType(['string' => TestCaseResultWithStdout::class])]
    public array $testCases;

    /**
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, TestCaseResultWithStdout>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->submissionId = $values['submissionId'];$this->testCases = $values['testCases'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
