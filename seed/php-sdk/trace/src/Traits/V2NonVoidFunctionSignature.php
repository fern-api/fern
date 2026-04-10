<?php

namespace Seed\Traits;

use Seed\Types\V2Parameter;
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
 * @property array<V2Parameter> $parameters
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
 * ) $returnType
 */
trait V2NonVoidFunctionSignature
{
    /**
     * @var array<V2Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2Parameter::class])]
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
     * ) $returnType
     */
    #[JsonProperty('returnType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $returnType;
}
