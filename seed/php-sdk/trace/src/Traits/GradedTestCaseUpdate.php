<?php

namespace Seed\Traits;

use Seed\Types\TestCaseGradeZero;
use Seed\Types\TestCaseGradeOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property string $testCaseId
 * @property (
 *    TestCaseGradeZero
 *   |TestCaseGradeOne
 * ) $grade
 */
trait GradedTestCaseUpdate
{
    /**
     * @var string $testCaseId
     */
    #[JsonProperty('testCaseId')]
    public string $testCaseId;

    /**
     * @var (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * ) $grade
     */
    #[JsonProperty('grade'), Union(TestCaseGradeZero::class, TestCaseGradeOne::class)]
    public TestCaseGradeZero|TestCaseGradeOne $grade;
}
