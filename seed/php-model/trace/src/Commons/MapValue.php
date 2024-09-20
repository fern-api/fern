<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class MapValue extends SerializableType
{
    /**
     * @var array<KeyValuePair> $keyValuePairs
     */
    #[JsonProperty('keyValuePairs'), ArrayType([KeyValuePair::class])]
    public array $keyValuePairs;

    /**
     * @param array{
     *   keyValuePairs: array<KeyValuePair>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->keyValuePairs = $values['keyValuePairs'];
    }
}
