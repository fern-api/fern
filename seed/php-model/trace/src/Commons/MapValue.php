<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\KeyValuePair;

class MapValue extends SerializableType
{
    #[JsonProperty("keyValuePairs"), ArrayType([KeyValuePair])]
    /**
     * @var array<KeyValuePair> $keyValuePairs
     */
    public array $keyValuePairs;

    /**
     * @param array<KeyValuePair> $keyValuePairs
     */
    public function __construct(
        array $keyValuePairs,
    ) {
        $this->keyValuePairs = $keyValuePairs;
    }
}
