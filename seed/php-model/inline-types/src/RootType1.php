<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RootType1 extends JsonSerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var InlineType1 $bar
     */
    #[JsonProperty('bar')]
    public InlineType1 $bar;

    /**
     * @param array{
     *   foo: string,
     *   bar: InlineType1,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
    }
}
