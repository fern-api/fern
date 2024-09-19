<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class MapType extends SerializableType
{
    /**
     * @var mixed $keyType
     */
    #[JsonProperty("keyType")]
    public mixed $keyType;

    /**
     * @var mixed $valueType
     */
    #[JsonProperty("valueType")]
    public mixed $valueType;

    /**
     * @param mixed $keyType
     * @param mixed $valueType
     */
    public function __construct(
        mixed $keyType,
        mixed $valueType,
    ) {
        $this->keyType = $keyType;
        $this->valueType = $valueType;
    }
}
