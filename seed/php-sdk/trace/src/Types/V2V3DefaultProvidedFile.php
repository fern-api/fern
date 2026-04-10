<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class V2V3DefaultProvidedFile extends JsonSerializableType
{
    /**
     * @var V2V3FileInfoV2 $file
     */
    #[JsonProperty('file')]
    public V2V3FileInfoV2 $file;

    /**
     * @var array<(
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
     * )> $relatedTypes
     */
    #[JsonProperty('relatedTypes'), ArrayType([new Union(VariableTypeZero::class, VariableTypeOne::class, VariableTypeTwo::class, VariableTypeThree::class, VariableTypeFour::class, VariableTypeFive::class, VariableTypeSix::class, VariableTypeSeven::class, VariableTypeEight::class, VariableTypeNine::class)])]
    public array $relatedTypes;

    /**
     * @param array{
     *   file: V2V3FileInfoV2,
     *   relatedTypes: array<(
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
     * )>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->relatedTypes = $values['relatedTypes'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
