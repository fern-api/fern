<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\UndiscriminatedUnion1InlineType1;
use Seed\Types\UndiscriminatedUnion1InlineType2;
use Seed\Types\UndiscriminatedUnion1InlineEnum1;
use Seed\Types\UndiscriminatedUnion1InlineListItem1;
use Seed\Types\UndiscriminatedUnion1InlineSetItem1;
use Seed\Types\UndiscriminatedUnion1InlineMapItem1;
use Seed\Types\ReferenceType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class GetUndiscriminatedUnionRequest extends JsonSerializableType
{
    /**
     * @var UndiscriminatedUnion1InlineType1|UndiscriminatedUnion1InlineType2|mixed|value-of<UndiscriminatedUnion1InlineEnum1>|string|array<UndiscriminatedUnion1InlineListItem1>|array<UndiscriminatedUnion1InlineSetItem1>|array<string, UndiscriminatedUnion1InlineMapItem1>|ReferenceType $bar
     */
    #[JsonProperty('bar'), Union(UndiscriminatedUnion1InlineType1::class, UndiscriminatedUnion1InlineType2::class, 'mixed', 'string', [UndiscriminatedUnion1InlineListItem1::class], [UndiscriminatedUnion1InlineSetItem1::class], ['string' => UndiscriminatedUnion1InlineMapItem1::class], ReferenceType::class)]
    public UndiscriminatedUnion1InlineType1|UndiscriminatedUnion1InlineType2|mixed|string|array|ReferenceType $bar;

    /**
     * @var string $foo
     */
    #[JsonProperty('foo')]
    public string $foo;

    /**
     * @param array{
     *   bar: UndiscriminatedUnion1InlineType1|UndiscriminatedUnion1InlineType2|mixed|value-of<UndiscriminatedUnion1InlineEnum1>|string|array<UndiscriminatedUnion1InlineListItem1>|array<UndiscriminatedUnion1InlineSetItem1>|array<string, UndiscriminatedUnion1InlineMapItem1>|ReferenceType,
     *   foo: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->bar = $values['bar'];
        $this->foo = $values['foo'];
    }
}
