<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ResponseType extends SerializableType
{
    #[JsonProperty("type")]
    /**
     * @var mixed $type
     */
    public mixed $type;

    /**
     * @param mixed $type
     */
    public function __construct(
        mixed $type,
    ) {
        $this->type = $type;
    }
}
