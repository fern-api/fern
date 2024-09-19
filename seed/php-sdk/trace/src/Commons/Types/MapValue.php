<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class MapValue extends SerializableType
{
    /**
     * @var array<KeyValuePair> $keyValuePairs
     */
    #[JsonProperty("keyValuePairs"), ArrayType([KeyValuePair::class])]
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
