<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\DebugKeyValuePairs;

class DebugMapValue extends SerializableType
{
    #[JsonProperty("keyValuePairs"), ArrayType([DebugKeyValuePairs])]
    /**
     * @var array<DebugKeyValuePairs> $keyValuePairs
     */
    public array $keyValuePairs;

    /**
     * @param array<DebugKeyValuePairs> $keyValuePairs
     */
    public function __construct(
        array $keyValuePairs,
    ) {
        $this->keyValuePairs = $keyValuePairs;
    }
}
