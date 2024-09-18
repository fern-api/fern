<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\TestCaseResultWithStdout;

class TracedTestCase extends SerializableType
{
    #[JsonProperty("result")]
    /**
     * @var TestCaseResultWithStdout $result
     */
    public TestCaseResultWithStdout $result;

    #[JsonProperty("traceResponsesSize")]
    /**
     * @var int $traceResponsesSize
     */
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
