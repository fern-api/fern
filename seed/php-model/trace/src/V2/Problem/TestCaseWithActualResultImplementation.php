<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseWithActualResultImplementation extends SerializableType
{
    /**
     * @var NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public NonVoidFunctionDefinition $getActualResult;

    /**
     * @var mixed $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck')]
    public mixed $assertCorrectnessCheck;

    /**
     * @param array{
     *   getActualResult: NonVoidFunctionDefinition,
     *   assertCorrectnessCheck: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->getActualResult = $values['getActualResult'];
        $this->assertCorrectnessCheck = $values['assertCorrectnessCheck'];
    }
}
