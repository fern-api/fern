<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseResultWithStdout extends SerializableType
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

    /**
     * @param array{
     *   result: TestCaseResult,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->result = $values['result'];
        $this->stdout = $values['stdout'];
    }
}
