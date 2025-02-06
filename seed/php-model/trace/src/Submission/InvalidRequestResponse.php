<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InvalidRequestResponse extends JsonSerializableType
{
    /**
     * @var mixed $request
     */
    #[JsonProperty('request')]
    public mixed $request;

    /**
     * @var mixed $cause
     */
    #[JsonProperty('cause')]
    public mixed $cause;

    /**
     * @param array{
     *   request: mixed,
     *   cause: mixed,
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
