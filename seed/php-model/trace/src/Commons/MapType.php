<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class MapType extends SerializableType
{
    #[JsonProperty("keyType")]
    /**
     * @var mixed $keyType
     */
    public mixed $keyType;

    #[JsonProperty("valueType")]
    /**
     * @var mixed $valueType
     */
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
