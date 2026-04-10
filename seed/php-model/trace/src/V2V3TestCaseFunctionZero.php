<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3TestCaseWithActualResultImplementation;
use Seed\Core\Json\JsonProperty;

class V2V3TestCaseFunctionZero extends JsonSerializableType
{
    use V2V3TestCaseWithActualResultImplementation;

    /**
     * @var value-of<V2V3TestCaseFunctionZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   getActualResult: V2V3NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: (
     *    V2V3AssertCorrectnessCheckZero
     *   |V2V3AssertCorrectnessCheckOne
     * ),
     *   type: value-of<V2V3TestCaseFunctionZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->getActualResult = $values['getActualResult'];
        $this->assertCorrectnessCheck = $values['assertCorrectnessCheck'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
