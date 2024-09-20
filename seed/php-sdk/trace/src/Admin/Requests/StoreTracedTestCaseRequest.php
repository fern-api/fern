<?php

namespace Seed\Admin\Requests;

use Seed\Submission\Types\TestCaseResultWithStdout;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\TraceResponse;
use Seed\Core\ArrayType;

class StoreTracedTestCaseRequest
{
    /**
     * @var TestCaseResultWithStdout $result
     */
    #[JsonProperty("result")]
    public TestCaseResultWithStdout $result;

    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty("traceResponses"), ArrayType([TraceResponse::class])]
    public array $traceResponses;

    /**
     * @param array{
     *   result: TestCaseResultWithStdout,
     *   traceResponses: array<TraceResponse>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->result = $values['result'];
        $this->traceResponses = $values['traceResponses'];
    }
}
