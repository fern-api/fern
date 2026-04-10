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
 * ) $valueType
 * @property ?bool $isFixedLength
 */
trait ListType
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
     * ) $valueType
     */
    #[JsonProperty('valueType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $valueType;

    /**
     * @var ?bool $isFixedLength Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
     */
    #[JsonProperty('isFixedLength')]
    public ?bool $isFixedLength;
}
