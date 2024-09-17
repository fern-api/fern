<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DebugKeyValuePairs extends SerializableType
{
    #[JsonProperty("key")]
    /**
     * @var mixed $key
     */
    public mixed $key;

    #[JsonProperty("value")]
    /**
     * @var mixed $value
     */
    public mixed $value;

    /**
     * @param mixed $key
     * @param mixed $value
     */
    public function __construct(
        mixed $key,
        mixed $value,
    ) {
        $this->key = $key;
        $this->value = $value;
    }
}
