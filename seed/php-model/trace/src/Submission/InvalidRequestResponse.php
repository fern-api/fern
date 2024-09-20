<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InvalidRequestResponse extends SerializableType
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
}
