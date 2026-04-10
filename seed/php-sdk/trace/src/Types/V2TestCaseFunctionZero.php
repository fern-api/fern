<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2TestCaseWithActualResultImplementation;
use Seed\Core\Json\JsonProperty;

class V2TestCaseFunctionZero extends JsonSerializableType
{
    use V2TestCaseWithActualResultImplementation;

    /**
     * @var value-of<V2TestCaseFunctionZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   getActualResult: V2NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: (
     *    V2AssertCorrectnessCheckZero
     *   |V2AssertCorrectnessCheckOne
     * ),
     *   type: value-of<V2TestCaseFunctionZeroType>,
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
