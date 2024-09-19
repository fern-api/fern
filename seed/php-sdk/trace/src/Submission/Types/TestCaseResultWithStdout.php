<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseResultWithStdout extends SerializableType
{
    /**
     * @var TestCaseResult $result
     */
    #[JsonProperty("result")]
    public TestCaseResult $result;

    /**
     * @var string $stdout
     */
    #[JsonProperty("stdout")]
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
