<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\TestCase;
use Seed\Core\ArrayType;

class TestSubmissionState extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var array<TestCase> $defaultTestCases
     */
    #[JsonProperty("defaultTestCases"), ArrayType([TestCase::class])]
    public array $defaultTestCases;

    /**
     * @var array<TestCase> $customTestCases
     */
    #[JsonProperty("customTestCases"), ArrayType([TestCase::class])]
    public array $customTestCases;

    /**
     * @var mixed $status
     */
    #[JsonProperty("status")]
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
