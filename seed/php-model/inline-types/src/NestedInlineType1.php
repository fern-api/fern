<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedInlineType1 extends JsonSerializableType
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
     * @var value-of<InlineEnum> $myEnum
     */
    #[JsonProperty('myEnum')]
    public string $myEnum;

    /**
     * @param array{
     *   foo: string,
     *   bar: string,
     *   myEnum: value-of<InlineEnum>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
        $this->myEnum = $values['myEnum'];
    }
}
