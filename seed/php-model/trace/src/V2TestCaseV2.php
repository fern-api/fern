<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Core\Types\ArrayType;

class V2TestCaseV2 extends JsonSerializableType
{
    /**
     * @var V2TestCaseMetadata $metadata
     */
    #[JsonProperty('metadata')]
    public V2TestCaseMetadata $metadata;

    /**
     * @var (
     *    V2TestCaseImplementationReferenceType
     *   |V2TestCaseImplementationReferenceOne
     * ) $implementation
     */
    #[JsonProperty('implementation'), Union(V2TestCaseImplementationReferenceType::class, V2TestCaseImplementationReferenceOne::class)]
    public V2TestCaseImplementationReferenceType|V2TestCaseImplementationReferenceOne $implementation;

    /**
     * @var array<string, (
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
     * )> $arguments
     */
    #[JsonProperty('arguments'), ArrayType(['string' => new Union(VariableValueZero::class, VariableValueOne::class, VariableValueTwo::class, VariableValueThree::class, VariableValueFour::class, VariableValueFive::class, VariableValueSix::class, VariableValueSeven::class, VariableValueEight::class, VariableValueNine::class, VariableValueType::class)])]
    public array $arguments;

    /**
     * @var ?V2TestCaseExpects $expects
     */
    #[JsonProperty('expects')]
    public ?V2TestCaseExpects $expects;

    /**
     * @param array{
     *   metadata: V2TestCaseMetadata,
     *   implementation: (
     *    V2TestCaseImplementationReferenceType
     *   |V2TestCaseImplementationReferenceOne
     * ),
     *   arguments: array<string, (
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
     * )>,
     *   expects?: ?V2TestCaseExpects,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->metadata = $values['metadata'];
        $this->implementation = $values['implementation'];
        $this->arguments = $values['arguments'];
        $this->expects = $values['expects'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
