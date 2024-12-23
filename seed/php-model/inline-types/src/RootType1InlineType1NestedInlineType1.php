<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class RootType1InlineType1NestedInlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var string $bar lorem ipsum
     */
    #[JsonProperty('bar')]
    public string $bar;

    /**
     * @var value-of<InlineEnum1> $myEnum lorem ipsum
     */
    #[JsonProperty('myEnum')]
    public string $myEnum;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   foo: string,
     *   bar: string,
     *   myEnum: value-of<InlineEnum1>,
     *   ref: ReferenceType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
        $this->myEnum = $values['myEnum'];
        $this->ref = $values['ref'];
    }
}
