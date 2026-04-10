<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TracedTestCase;
use Seed\Core\Json\JsonProperty;

class SubmissionStatusForTestCaseTwo extends JsonSerializableType
{
    use TracedTestCase;

    /**
     * @var value-of<SubmissionStatusForTestCaseTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   result: TestCaseResultWithStdout,
     *   traceResponsesSize: int,
     *   type: value-of<SubmissionStatusForTestCaseTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->result = $values['result'];
        $this->traceResponsesSize = $values['traceResponsesSize'];
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
