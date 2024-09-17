<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\TestCase;

class TestSubmissionState extends SerializableType
{
    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("defaultTestCases"), ArrayType([TestCase::class])]
    /**
     * @var array<TestCase> $defaultTestCases
     */
    public array $defaultTestCases;

    #[JsonProperty("customTestCases"), ArrayType([TestCase::class])]
    /**
     * @var array<TestCase> $customTestCases
     */
    public array $customTestCases;

    #[JsonProperty("status")]
    /**
     * @var mixed $status
     */
    public mixed $status;

    /**
     * @param string $problemId
     * @param array<TestCase> $defaultTestCases
     * @param array<TestCase> $customTestCases
     * @param mixed $status
     */
    public function __construct(
        string $problemId,
        array $defaultTestCases,
        array $customTestCases,
        mixed $status,
    ) {
        $this->problemId = $problemId;
        $this->defaultTestCases = $defaultTestCases;
        $this->customTestCases = $customTestCases;
        $this->status = $status;
    }
}
