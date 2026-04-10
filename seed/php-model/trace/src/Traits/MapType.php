<?php

namespace Seed\Traits;

use Seed\VariableTypeZero;
use Seed\VariableTypeOne;
use Seed\VariableTypeTwo;
use Seed\VariableTypeThree;
use Seed\VariableTypeFour;
use Seed\VariableTypeFive;
use Seed\VariableTypeSix;
use Seed\VariableTypeSeven;
use Seed\VariableTypeEight;
use Seed\VariableTypeNine;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
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
 * ) $keyType
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
 * ) $valueType
 */
trait MapType
{
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
     * ) $keyType
     */
    #[JsonProperty('keyType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $keyType;

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
     * ) $valueType
     */
    #[JsonProperty('valueType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $valueType;
}
