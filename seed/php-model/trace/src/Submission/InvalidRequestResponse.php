<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InvalidRequestResponse extends SerializableType
{
    /**
     * @var mixed $request
     */
    #[JsonProperty("request")]
    public mixed $request;

    /**
     * @var mixed $cause
     */
    #[JsonProperty("cause")]
    public mixed $cause;

    /**
     * @param mixed $request
     * @param mixed $cause
     */
    public function __construct(
        mixed $request,
        mixed $cause,
    ) {
        $this->request = $request;
        $this->cause = $cause;
    }
}
