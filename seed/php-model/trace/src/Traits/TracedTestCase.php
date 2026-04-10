<?php

namespace Seed\Traits;

use Seed\TestCaseResultWithStdout;
use Seed\Core\Json\JsonProperty;

/**
 * @property TestCaseResultWithStdout $result
 * @property int $traceResponsesSize
 */
trait TracedTestCase
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
}
