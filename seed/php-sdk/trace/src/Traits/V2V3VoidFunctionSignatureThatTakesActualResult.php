<?php

namespace Seed\Traits;

use Seed\Types\V2V3Parameter;
use Seed\Types\VariableTypeZero;
use Seed\Types\VariableTypeOne;
use Seed\Types\VariableTypeTwo;
use Seed\Types\VariableTypeThree;
use Seed\Types\VariableTypeFour;
use Seed\Types\VariableTypeFive;
use Seed\Types\VariableTypeSix;
use Seed\Types\VariableTypeSeven;
use Seed\Types\VariableTypeEight;
use Seed\Types\VariableTypeNine;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

/**
 * @property array<V2V3Parameter> $parameters
 * @property (
 *    VariableTypeZero
 *   |VariableTypeOne
 *   |VariableTypeTwo
 *   |VariableTypeThree
 *   |VariableTypeFour
 *   |VariableTypeFive
 *   |VariableTypeSix
 *   |VariableTypeSeven
 *   |VariableTypeEight
 *   |VariableTypeNine
 * ) $actualResultType
 */
trait V2V3VoidFunctionSignatureThatTakesActualResult
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;

    /**
     * @var (
     *    VariableTypeZero
     *   |VariableTypeOne
     *   |VariableTypeTwo
     *   |VariableTypeThree
     *   |VariableTypeFour
     *   |VariableTypeFive
     *   |VariableTypeSix
     *   |VariableTypeSeven
     *   |VariableTypeEight
     *   |VariableTypeNine
     * ) $actualResultType
     */
    #[JsonProperty('actualResultType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $actualResultType;
}
