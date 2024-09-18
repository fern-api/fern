<?php

namespace Seed\LangServer\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class LangServerRequest extends SerializableType
{
    #[JsonProperty("request")]
    /**
     * @var mixed $request
     */
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
