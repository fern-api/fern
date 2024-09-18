<?php

namespace Seed\LangServer;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class LangServerRequest extends SerializableType
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
