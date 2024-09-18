<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseWithActualResultImplementation extends SerializableType
{
    /**
     * @var NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty("getActualResult")]
    public NonVoidFunctionDefinition $getActualResult;

    /**
     * @var mixed $assertCorrectnessCheck
     */
    #[JsonProperty("assertCorrectnessCheck")]
    public mixed $assertCorrectnessCheck;

    /**
     * @param NonVoidFunctionDefinition $getActualResult
     * @param mixed $assertCorrectnessCheck
     */
    public function __construct(
        NonVoidFunctionDefinition $getActualResult,
        mixed $assertCorrectnessCheck,
    ) {
        $this->getActualResult = $getActualResult;
        $this->assertCorrectnessCheck = $assertCorrectnessCheck;
    }
}
