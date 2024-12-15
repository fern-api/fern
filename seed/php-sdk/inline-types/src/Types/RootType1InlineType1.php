<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class RootType1InlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var RootType1InlineType1NestedInlineType1 $bar lorem ipsum
     */
    #[JsonProperty('bar')]
    public RootType1InlineType1NestedInlineType1 $bar;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   foo: string,
     *   bar: RootType1InlineType1NestedInlineType1,
     *   ref: ReferenceType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
        $this->ref = $values['ref'];
    }
}
