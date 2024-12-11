<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var NestedInlineType1 $bar
     */
    #[JsonProperty('bar')]
    public NestedInlineType1 $bar;

    /**
     * @param array{
     *   foo: string,
     *   bar: NestedInlineType1,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
    }
}
