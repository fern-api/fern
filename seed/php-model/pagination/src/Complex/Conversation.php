<?php

namespace Seed\Complex;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Conversation extends JsonSerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

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
    public function __toString(): string {
        return $this->toJson();
    }
}
