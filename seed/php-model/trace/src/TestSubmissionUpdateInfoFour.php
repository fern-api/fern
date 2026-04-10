<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\RecordedTestCaseUpdate;
use Seed\Core\Json\JsonProperty;

class TestSubmissionUpdateInfoFour extends JsonSerializableType
{
    use RecordedTestCaseUpdate;

    /**
     * @var value-of<TestSubmissionUpdateInfoFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   testCaseId: string,
     *   traceResponsesSize: int,
     *   type: value-of<TestSubmissionUpdateInfoFourType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->testCaseId = $values['testCaseId'];
        $this->traceResponsesSize = $values['traceResponsesSize'];
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
