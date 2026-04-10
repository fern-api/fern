<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GradedResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateFour extends JsonSerializableType
{
    use GradedResponse;

    /**
     * @var value-of<CodeExecutionUpdateFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, TestCaseResultWithStdout>,
     *   type: value-of<CodeExecutionUpdateFourType>,
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
