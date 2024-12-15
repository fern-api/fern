<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AliasInlineValue extends JsonSerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var string $bar
     */
    #[JsonProperty('bar')]
    public string $bar;

    /**
     * @param array{
     *   foo: string,
     *   bar: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
    }
}
