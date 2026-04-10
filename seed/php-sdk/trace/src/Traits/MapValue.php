<?php

namespace Seed\Traits;

use Seed\Types\KeyValuePair;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<KeyValuePair> $keyValuePairs
 */
trait MapValue
{
    /**
     * @var array<KeyValuePair> $keyValuePairs
     */
    #[JsonProperty('keyValuePairs'), ArrayType([KeyValuePair::class])]
    public array $keyValuePairs;
}
