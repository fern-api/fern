<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\TestCaseResult;

class TestCaseResultWithStdout extends SerializableType
{
    #[JsonProperty("result")]
    /**
     * @var TestCaseResult $result
     */
    public TestCaseResult $result;

    #[JsonProperty("stdout")]
    /**
     * @var string $stdout
     */
    public string $stdout;

    /**
     * @param TestCaseResult $result
     * @param string $stdout
     */
    public function __construct(
        TestCaseResult $result,
        string $stdout,
    ) {
        $this->result = $result;
        $this->stdout = $stdout;
    }
}
