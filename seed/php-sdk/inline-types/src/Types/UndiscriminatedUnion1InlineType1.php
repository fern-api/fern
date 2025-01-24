<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * lorem ipsum
 */
class UndiscriminatedUnion1InlineType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var UndiscriminatedUnion1InlineType1InlineType1 $bar lorem ipsum
     */
    #[JsonProperty('bar')]
    public UndiscriminatedUnion1InlineType1InlineType1 $bar;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   foo: string,
     *   bar: UndiscriminatedUnion1InlineType1InlineType1,
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
