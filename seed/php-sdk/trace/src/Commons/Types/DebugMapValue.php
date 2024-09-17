<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\DebugKeyValuePairs;

class DebugMapValue extends SerializableType
{
    #[JsonProperty("keyValuePairs"), ArrayType([DebugKeyValuePairs::class])]
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
