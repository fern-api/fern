<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TracedTestCase extends SerializableType
{
    /**
     * @var TestCaseResultWithStdout $result
     */
    #[JsonProperty('result')]
    public TestCaseResultWithStdout $result;

    /**
     * @var int $traceResponsesSize
     */
    #[JsonProperty('traceResponsesSize')]
    public int $traceResponsesSize;

    /**
     * @param array{
     *   result: TestCaseResultWithStdout,
     *   traceResponsesSize: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->result = $values['result'];
        $this->traceResponsesSize = $values['traceResponsesSize'];
    }
}
