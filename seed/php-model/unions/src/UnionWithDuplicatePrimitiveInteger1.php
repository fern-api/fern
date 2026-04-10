<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDuplicatePrimitiveInteger1 extends JsonSerializableType
{
    /**
     * @var ?int $value
     */
    #[JsonProperty('value')]
    public ?int $value;

    /**
     * @param array{
     *   value?: ?int,
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
