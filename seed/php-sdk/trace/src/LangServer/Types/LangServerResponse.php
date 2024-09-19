<?php

namespace Seed\LangServer\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class LangServerResponse extends SerializableType
{
    /**
     * @var mixed $response
     */
    #[JsonProperty("response")]
    public mixed $response;

    /**
     * @param mixed $response
     */
    public function __construct(
        mixed $response,
    ) {
        $this->response = $response;
    }
}
