<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\InvalidRequestResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateNine extends JsonSerializableType
{
    use InvalidRequestResponse;

    /**
     * @var value-of<CodeExecutionUpdateNineType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   request: (
     *    SubmissionRequestZero
     *   |SubmissionRequestType
     *   |SubmissionRequestTwo
     *   |SubmissionRequestThree
     *   |SubmissionRequestFour
     * ),
     *   cause: (
     *    InvalidRequestCauseZero
     *   |InvalidRequestCauseOne
     *   |InvalidRequestCauseTwo
     * ),
     *   type: value-of<CodeExecutionUpdateNineType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->request = $values['request'];
        $this->cause = $values['cause'];
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
