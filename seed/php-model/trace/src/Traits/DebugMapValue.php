<?php

namespace Seed\Traits;

use Seed\DebugKeyValuePairs;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<DebugKeyValuePairs> $keyValuePairs
 */
trait DebugMapValue
{
    /**
     * @var array<DebugKeyValuePairs> $keyValuePairs
     */
    #[JsonProperty('keyValuePairs'), ArrayType([DebugKeyValuePairs::class])]
    public array $keyValuePairs;
}
