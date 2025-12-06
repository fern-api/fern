<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class MapValue extends JsonSerializableType
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
    )
    {
        $this->keyValuePairs = $values['keyValuePairs'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
