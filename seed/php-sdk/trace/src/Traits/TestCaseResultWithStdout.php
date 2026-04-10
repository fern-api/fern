<?php

namespace Seed\Traits;

use Seed\Types\TestCaseResult;
use Seed\Core\Json\JsonProperty;

/**
 * @property TestCaseResult $result
 * @property string $stdout
 */
trait TestCaseResultWithStdout
{
    /**
     * @var TestCaseResult $result
     */
    #[JsonProperty('result')]
    public TestCaseResult $result;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;
}
