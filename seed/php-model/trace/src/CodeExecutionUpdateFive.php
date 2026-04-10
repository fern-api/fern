<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GradedResponseV2;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateFive extends JsonSerializableType
{
    use GradedResponseV2;

    /**
     * @var value-of<CodeExecutionUpdateFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, (
     *    TestCaseGradeZero
     *   |TestCaseGradeOne
     * )>,
     *   type: value-of<CodeExecutionUpdateFiveType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->testCases = $values['testCases'];
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
