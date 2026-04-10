<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TestCaseResultWithStdout;
use Seed\Core\Json\JsonProperty;
use Seed\Types\TraceResponse;
use Seed\Core\Types\ArrayType;

class AdminStoreTracedTestCaseRequest extends JsonSerializableType
{
    /**
     * @var TestCaseResultWithStdout $result
     */
    #[JsonProperty('result')]
    public TestCaseResultWithStdout $result;

    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty('traceResponses'), ArrayType([TraceResponse::class])]
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
