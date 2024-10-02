<?php

namespace Seed\Commons;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class DebugMapValue extends SerializableType
{
    /**
     * @var array<DebugKeyValuePairs> $keyValuePairs
     */
    #[JsonProperty('keyValuePairs'), ArrayType([DebugKeyValuePairs::class])]
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
