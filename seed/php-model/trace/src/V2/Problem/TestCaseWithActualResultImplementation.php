<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\Problem\NonVoidFunctionDefinition;

class TestCaseWithActualResultImplementation extends SerializableType
{
    #[JsonProperty("getActualResult")]
    /**
     * @var NonVoidFunctionDefinition $getActualResult
     */
    public NonVoidFunctionDefinition $getActualResult;

    #[JsonProperty("assertCorrectnessCheck")]
    /**
     * @var mixed $assertCorrectnessCheck
     */
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
