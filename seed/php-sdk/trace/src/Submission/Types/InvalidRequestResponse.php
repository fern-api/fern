<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InvalidRequestResponse extends JsonSerializableType
{
    /**
     * @var SubmissionRequest $request
     */
    #[JsonProperty('request')]
    public SubmissionRequest $request;

    /**
     * @var InvalidRequestCause $cause
     */
    #[JsonProperty('cause')]
    public InvalidRequestCause $cause;

    /**
     * @param array{
     *   request: SubmissionRequest,
     *   cause: InvalidRequestCause,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->request = $values['request'];$this->cause = $values['cause'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
