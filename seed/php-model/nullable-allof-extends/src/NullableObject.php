<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * This schema has nullable:true at the top level.
 */
class NullableObject extends JsonSerializableType
{
    /**
     * @var ?string $nullableField
     */
    #[JsonProperty('nullableField')]
    public ?string $nullableField;

    /**
     * @param array{
     *   nullableField?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->nullableField = $values['nullableField'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
