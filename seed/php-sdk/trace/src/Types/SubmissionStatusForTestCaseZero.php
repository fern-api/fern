<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TestCaseResultWithStdout;
use Seed\Core\Json\JsonProperty;

class SubmissionStatusForTestCaseZero extends JsonSerializableType
{
    use TestCaseResultWithStdout;

    /**
     * @var value-of<SubmissionStatusForTestCaseZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   result: TestCaseResult,
     *   stdout: string,
     *   type: value-of<SubmissionStatusForTestCaseZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->result = $values['result'];
        $this->stdout = $values['stdout'];
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
