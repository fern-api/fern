<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Request extends SerializableType
{
    /**
     * @var mixed $request
     */
    #[JsonProperty("request")]
    public mixed $request;

    /**
     * @param mixed $request
     */
    public function __construct(
        mixed $request,
    ) {
        $this->request = $request;
    }
}
