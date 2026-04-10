<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithNullableReferenceFoo extends JsonSerializableType
{
    /**
     * @var ?Foo $value
     */
    #[JsonProperty('value')]
    public ?Foo $value;

    /**
     * @param array{
     *   value?: ?Foo,
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
