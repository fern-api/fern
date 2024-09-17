<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class InvalidRequestResponse extends SerializableType
{
    #[JsonProperty("request")]
    /**
     * @var mixed $request
     */
    public mixed $request;

    #[JsonProperty("cause")]
    /**
     * @var mixed $cause
     */
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
