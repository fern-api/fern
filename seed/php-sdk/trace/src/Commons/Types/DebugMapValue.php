<?php

namespace Seed\Commons\Types;

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
     * @param array{
     *   keyValuePairs: array<DebugKeyValuePairs>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->keyValuePairs = $values['keyValuePairs'];
    }
}
