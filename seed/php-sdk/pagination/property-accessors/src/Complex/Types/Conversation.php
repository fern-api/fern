<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Conversation extends JsonSerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    private string $foo;

    /**
     * @param array{
     *   foo: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->foo = $values['foo'];
    }

    /**
     * @return string
     */
    public function getFoo(): string {
        return $this->foo;}

    /**
     * @param string $value
     */
    public function setFoo(string $value): self {
        $this->foo = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
