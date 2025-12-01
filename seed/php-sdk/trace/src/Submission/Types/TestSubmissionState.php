<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\TestCase;
use Seed\Core\Types\ArrayType;

class TestSubmissionState extends JsonSerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var array<TestCase> $defaultTestCases
     */
    #[JsonProperty('defaultTestCases'), ArrayType([TestCase::class])]
    public array $defaultTestCases;

    /**
     * @var array<TestCase> $customTestCases
     */
    #[JsonProperty('customTestCases'), ArrayType([TestCase::class])]
    public array $customTestCases;

    /**
     * @var TestSubmissionStatus $status
     */
    #[JsonProperty('status')]
    public TestSubmissionStatus $status;

    /**
     * @param array{
     *   problemId: string,
     *   defaultTestCases: array<TestCase>,
     *   customTestCases: array<TestCase>,
     *   status: TestSubmissionStatus,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemId = $values['problemId'];$this->defaultTestCases = $values['defaultTestCases'];$this->customTestCases = $values['customTestCases'];$this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
