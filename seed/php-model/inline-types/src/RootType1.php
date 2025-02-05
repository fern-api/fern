<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * lorem ipsum
 */
class RootType1 extends JsonSerializableType
{
    /**
     * @var string $foo lorem ipsum
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @var RootType1InlineType1 $bar lorem ipsum
     */
    #[JsonProperty('bar')]
    public RootType1InlineType1 $bar;

    /**
     * @var array<string, RootType1FooMapValue> $fooMap lorem ipsum
     */
    #[JsonProperty('fooMap'), ArrayType(['string' => RootType1FooMapValue::class])]
    public array $fooMap;

    /**
     * @var array<RootType1FooListItem> $fooList lorem ipsum
     */
    #[JsonProperty('fooList'), ArrayType([RootType1FooListItem::class])]
    public array $fooList;

    /**
     * @var array<RootType1FooSetItem> $fooSet lorem ipsum
     */
    #[JsonProperty('fooSet'), ArrayType([RootType1FooSetItem::class])]
    public array $fooSet;

    /**
     * @var ReferenceType $ref lorem ipsum
     */
    #[JsonProperty('ref')]
    public ReferenceType $ref;

    /**
     * @param array{
     *   foo: string,
     *   bar: RootType1InlineType1,
     *   fooMap: array<string, RootType1FooMapValue>,
     *   fooList: array<RootType1FooListItem>,
     *   fooSet: array<RootType1FooSetItem>,
     *   ref: ReferenceType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->foo = $values['foo'];
        $this->bar = $values['bar'];
        $this->fooMap = $values['fooMap'];
        $this->fooList = $values['fooList'];
        $this->fooSet = $values['fooSet'];
        $this->ref = $values['ref'];
    }
}
