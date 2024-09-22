<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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
