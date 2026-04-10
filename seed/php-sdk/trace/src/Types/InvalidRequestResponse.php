<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class InvalidRequestResponse extends JsonSerializableType
{
    /**
     * @var (
     *    SubmissionRequestZero
     *   |SubmissionRequestType
     *   |SubmissionRequestTwo
     *   |SubmissionRequestThree
     *   |SubmissionRequestFour
     * ) $request
     */
    #[JsonProperty('request'), Union(SubmissionRequestZero::class, SubmissionRequestType::class, SubmissionRequestTwo::class, SubmissionRequestThree::class, SubmissionRequestFour::class)]
    public SubmissionRequestZero|SubmissionRequestType|SubmissionRequestTwo|SubmissionRequestThree|SubmissionRequestFour $request;

    /**
     * @var (
     *    InvalidRequestCauseZero
     *   |InvalidRequestCauseOne
     *   |InvalidRequestCauseTwo
     * ) $cause
     */
    #[JsonProperty('cause'), Union(InvalidRequestCauseZero::class, InvalidRequestCauseOne::class, InvalidRequestCauseTwo::class)]
    public InvalidRequestCauseZero|InvalidRequestCauseOne|InvalidRequestCauseTwo $cause;

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
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->request = $values['request'];
        $this->cause = $values['cause'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
