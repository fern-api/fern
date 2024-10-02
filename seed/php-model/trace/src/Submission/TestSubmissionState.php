<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\TestCase;
use Seed\Core\Types\ArrayType;

class TestSubmissionState extends SerializableType
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
     * @var mixed $status
     */
    #[JsonProperty('status')]
    public mixed $status;

    /**
     * @param array{
     *   problemId: string,
     *   defaultTestCases: array<TestCase>,
     *   customTestCases: array<TestCase>,
     *   status: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->defaultTestCases = $values['defaultTestCases'];
        $this->customTestCases = $values['customTestCases'];
        $this->status = $values['status'];
    }
}
