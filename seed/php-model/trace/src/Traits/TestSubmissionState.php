<?php

namespace Seed\Traits;

use Seed\TestCase;
use Seed\TestSubmissionStatus;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $problemId
 * @property array<TestCase> $defaultTestCases
 * @property array<TestCase> $customTestCases
 * @property TestSubmissionStatus $status
 */
trait TestSubmissionState
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
}
