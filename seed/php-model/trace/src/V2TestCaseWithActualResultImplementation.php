<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2TestCaseWithActualResultImplementation extends JsonSerializableType
{
    /**
     * @var V2NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public V2NonVoidFunctionDefinition $getActualResult;

    /**
     * @var (
     *    V2AssertCorrectnessCheckZero
     *   |V2AssertCorrectnessCheckOne
     * ) $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck'), Union(V2AssertCorrectnessCheckZero::class, V2AssertCorrectnessCheckOne::class)]
    public V2AssertCorrectnessCheckZero|V2AssertCorrectnessCheckOne $assertCorrectnessCheck;

    /**
     * @param array{
     *   getActualResult: V2NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: (
     *    V2AssertCorrectnessCheckZero
     *   |V2AssertCorrectnessCheckOne
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
