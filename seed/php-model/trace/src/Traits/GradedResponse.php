<?php

namespace Seed\Traits;

use Seed\TestCaseResultWithStdout;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $submissionId
 * @property array<string, TestCaseResultWithStdout> $testCases
 */
trait GradedResponse
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
}
