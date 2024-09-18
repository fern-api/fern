<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\KeyValuePair;

class MapValue extends SerializableType
{
    #[JsonProperty("keyValuePairs"), ArrayType([KeyValuePair::class])]
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
