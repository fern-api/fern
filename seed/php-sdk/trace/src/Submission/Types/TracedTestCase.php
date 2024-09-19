<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TracedTestCase extends SerializableType
{
    /**
     * @var TestCaseResultWithStdout $result
     */
    #[JsonProperty("result")]
    public TestCaseResultWithStdout $result;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty("traceResponsesSize")]
    public int $traceResponsesSize;

    /**
     * @param TestCaseResultWithStdout $result
     * @param int $traceResponsesSize
     */
    public function __construct(
        TestCaseResultWithStdout $result,
        int $traceResponsesSize,
    ) {
        $this->result = $result;
        $this->traceResponsesSize = $traceResponsesSize;
    }
}
