<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseResultWithStdout extends JsonSerializableType
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
    )
    {
        $this->result = $values['result'];$this->stdout = $values['stdout'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
