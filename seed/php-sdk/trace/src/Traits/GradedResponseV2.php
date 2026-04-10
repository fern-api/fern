<?php

namespace Seed\Traits;

use Seed\Types\TestCaseGradeZero;
use Seed\Types\TestCaseGradeOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

/**
 * @property string $submissionId
 * @property array<string, (
 *    TestCaseGradeZero
 *   |TestCaseGradeOne
 * )> $testCases
 */
trait GradedResponseV2
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
}
