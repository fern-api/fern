<?php

namespace Seed\Traits;

use Seed\Types\VariableValueZero;
use Seed\Types\VariableValueOne;
use Seed\Types\VariableValueTwo;
use Seed\Types\VariableValueThree;
use Seed\Types\VariableValueFour;
use Seed\Types\VariableValueFive;
use Seed\Types\VariableValueSix;
use Seed\Types\VariableValueSeven;
use Seed\Types\VariableValueEight;
use Seed\Types\VariableValueNine;
use Seed\Types\VariableValueType;
use Seed\Types\ExceptionV2Zero;
use Seed\Types\ExceptionV2Type;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property bool $passed
 * @property (
 *    VariableValueZero
 *   |VariableValueOne
 *   |VariableValueTwo
 *   |VariableValueThree
 *   |VariableValueFour
 *   |VariableValueFive
 *   |VariableValueSix
 *   |VariableValueSeven
 *   |VariableValueEight
 *   |VariableValueNine
 *   |VariableValueType
 * )|null $actualResult
 * @property (
 *    ExceptionV2Zero
 *   |ExceptionV2Type
 * )|null $exception
 * @property string $stdout
 */
trait TestCaseNonHiddenGrade
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;

    /**
     * @var (
     *    VariableValueZero
     *   |VariableValueOne
     *   |VariableValueTwo
     *   |VariableValueThree
     *   |VariableValueFour
     *   |VariableValueFive
     *   |VariableValueSix
     *   |VariableValueSeven
     *   |VariableValueEight
     *   |VariableValueNine
     *   |VariableValueType
     * )|null $actualResult
     */
    #[JsonProperty('actualResult'), Union(VariableValueZero::class, VariableValueOne::class, VariableValueTwo::class, VariableValueThree::class, VariableValueFour::class, VariableValueFive::class, VariableValueSix::class, VariableValueSeven::class, VariableValueEight::class, VariableValueNine::class, VariableValueType::class, 'null')]
    public VariableValueZero|VariableValueOne|VariableValueTwo|VariableValueThree|VariableValueFour|VariableValueFive|VariableValueSix|VariableValueSeven|VariableValueEight|VariableValueNine|VariableValueType|null $actualResult;

    /**
     * @var (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null $exception
     */
    #[JsonProperty('exception'), Union(ExceptionV2Zero::class, ExceptionV2Type::class, 'null')]
    public ExceptionV2Zero|ExceptionV2Type|null $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;
}
