<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithSameNumberTypesAnyNumber extends JsonSerializableType
{
    /**
     * @var ?float $value
     */
    #[JsonProperty('value')]
    public ?float $value;

    /**
     * @param array{
     *   value?: ?float,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
