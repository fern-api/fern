<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DebugMapValue extends SerializableType
{
    /**
     * @var array<DebugKeyValuePairs> $keyValuePairs
     */
    #[JsonProperty("keyValuePairs"), ArrayType([DebugKeyValuePairs::class])]
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
