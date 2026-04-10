<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithNullableReferenceFoo extends JsonSerializableType
{
    /**
     * @var ?Foo $value
     */
    #[JsonProperty('value')]
    private ?Foo $value;

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
     * @return ?Foo
     */
    public function getValue(): ?Foo
    {
        return $this->value;
    }

    /**
     * @param ?Foo $value
     */
    public function setValue(?Foo $value = null): self
    {
        $this->value = $value;
        $this->_setField('value');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
