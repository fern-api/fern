<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDiscriminantFoo extends JsonSerializableType
{
    /**
     * @var ?Foo $foo
     */
    #[JsonProperty('foo')]
    private ?Foo $foo;

    /**
     * @param array{
     *   foo?: ?Foo,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->foo = $values['foo'] ?? null;
    }

    /**
     * @return ?Foo
     */
    public function getFoo(): ?Foo
    {
        return $this->foo;
    }

    /**
     * @param ?Foo $value
     */
    public function setFoo(?Foo $value = null): self
    {
        $this->foo = $value;
        $this->_setField('foo');
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
