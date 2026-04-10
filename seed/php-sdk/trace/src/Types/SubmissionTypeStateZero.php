<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TestSubmissionState;
use Seed\Core\Json\JsonProperty;

class SubmissionTypeStateZero extends JsonSerializableType
{
    use TestSubmissionState;

    /**
     * @var value-of<SubmissionTypeStateZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   problemId: string,
     *   defaultTestCases: array<TestCase>,
     *   customTestCases: array<TestCase>,
     *   status: TestSubmissionStatus,
     *   type: value-of<SubmissionTypeStateZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->defaultTestCases = $values['defaultTestCases'];
        $this->customTestCases = $values['customTestCases'];
        $this->status = $values['status'];
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
