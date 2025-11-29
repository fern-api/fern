<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseWithActualResultImplementation extends JsonSerializableType
{
    /**
     * @var NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public NonVoidFunctionDefinition $getActualResult;

    /**
     * @var AssertCorrectnessCheck $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck')]
    public AssertCorrectnessCheck $assertCorrectnessCheck;

    /**
     * @param array{
     *   getActualResult: NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: AssertCorrectnessCheck,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->getActualResult = $values['getActualResult'];$this->assertCorrectnessCheck = $values['assertCorrectnessCheck'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
