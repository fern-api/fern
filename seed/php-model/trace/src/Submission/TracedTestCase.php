<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TracedTestCase extends JsonSerializableType
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
    )
    {
        $this->result = $values['result'];$this->traceResponsesSize = $values['traceResponsesSize'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
