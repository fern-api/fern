<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2V3TestCaseWithActualResultImplementation extends JsonSerializableType
{
    /**
     * @var V2V3NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public V2V3NonVoidFunctionDefinition $getActualResult;

    /**
     * @var (
     *    V2V3AssertCorrectnessCheckZero
     *   |V2V3AssertCorrectnessCheckOne
     * ) $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck'), Union(V2V3AssertCorrectnessCheckZero::class, V2V3AssertCorrectnessCheckOne::class)]
    public V2V3AssertCorrectnessCheckZero|V2V3AssertCorrectnessCheckOne $assertCorrectnessCheck;

    /**
     * @param array{
     *   getActualResult: V2V3NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: (
     *    V2V3AssertCorrectnessCheckZero
     *   |V2V3AssertCorrectnessCheckOne
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->getActualResult = $values['getActualResult'];
        $this->assertCorrectnessCheck = $values['assertCorrectnessCheck'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
