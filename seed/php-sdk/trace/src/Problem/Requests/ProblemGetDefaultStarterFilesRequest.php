<?php

namespace Seed\Problem\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\VariableTypeAndName;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
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
use Seed\Core\Types\Union;

class ProblemGetDefaultStarterFilesRequest extends JsonSerializableType
{
    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    #[JsonProperty('inputParams'), ArrayType([VariableTypeAndName::class])]
    public array $inputParams;

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
     * ) $outputType
     */
    #[JsonProperty('outputType'), Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)]
    public VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine $outputType;

    /**
     * The name of the `method` that the student has to complete.
     * The method name cannot include the following characters:
     *   - Greater Than `>`
     *   - Less Than `<``
     *   - Equals `=`
     *   - Period `.`
     *
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @param array{
     *   inputParams: array<VariableTypeAndName>,
     *   outputType: (
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
     * ),
     *   methodName: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->inputParams = $values['inputParams'];
        $this->outputType = $values['outputType'];
        $this->methodName = $values['methodName'];
    }
}
