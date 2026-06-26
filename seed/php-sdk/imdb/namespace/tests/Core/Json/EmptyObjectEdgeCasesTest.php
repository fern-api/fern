<?php

namespace Fern\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Fern\Core\Json\JsonEncoder;
use Fern\Core\Json\JsonProperty;
use Fern\Core\Json\JsonSerializableType;
use Fern\Core\Types\ArrayType;
use Fern\Core\Types\Union;

/**
 * Object with both a list and a map property to prove the fix discriminates correctly.
 */
class ObjectWithListAndMap extends JsonSerializableType
{
    /**
     * @var string[] $list
     */
    #[ArrayType(['string'])]
    #[JsonProperty('list')]
    public array $list;

    /**
     * @var array<string, string> $map
     */
    #[ArrayType(['string' => 'string'])]
    #[JsonProperty('map')]
    public array $map;

    /**
     * @param array{
     *   list: string[],
     *   map: array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->list = $values['list'];
        $this->map = $values['map'];
    }
}

/**
 * Empty object used as a union member to test the stdClass guard path.
 */
class EmptyUnionMember extends JsonSerializableType
{
    /**
     * @var string|null $tag
     */
    #[JsonProperty('tag')]
    public ?string $tag;

    /**
     * @param array{
     *   tag?: string|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->tag = $values['tag'] ?? null;
    }
}

/**
 * Object with a union property that can hold an empty object.
 */
class ObjectWithUnionEmpty extends JsonSerializableType
{
    /**
     * @var string|EmptyUnionMember|null $value
     */
    #[Union('string', EmptyUnionMember::class, 'null')]
    #[JsonProperty('value')]
    public mixed $value;

    /**
     * @param array{
     *   value: string|EmptyUnionMember|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
    }
}

/**
 * Object with a list of maps (each map can be empty).
 */
class ObjectWithListOfMaps extends JsonSerializableType
{
    /**
     * @var array<int, array<string, string>> $items
     */
    #[ArrayType([['string' => 'string']])]
    #[JsonProperty('items')]
    public array $items;

    /**
     * @param array{
     *   items: array<int, array<string, string>>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->items = $values['items'];
    }
}

/**
 * Object with a map whose values are nested objects (which can be empty).
 */
class ObjectWithMapOfObjects extends JsonSerializableType
{
    /**
     * @var array<string, EmptyUnionMember> $entries
     */
    #[ArrayType(['string' => EmptyUnionMember::class])]
    #[JsonProperty('entries')]
    public array $entries;

    /**
     * @param array{
     *   entries: array<string, EmptyUnionMember>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->entries = $values['entries'];
    }
}

/**
 * Object with only optional properties to test additionalProperties interaction.
 */
class ObjectWithAdditionalOnly extends JsonSerializableType
{
    /**
     * @var string|null $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @param array{
     *   name?: string|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->name = $values['name'] ?? null;
    }
}

class EmptyObjectEdgeCasesTest extends TestCase
{
    /**
     * Test 1: List-vs-map discrimination.
     * Empty lists must stay [] while empty maps must become {}.
     */
    public function testEmptyListAndEmptyMapSideBySide(): void
    {
        $object = new ObjectWithListAndMap(['list' => [], 'map' => []]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"list":[],"map":{}}',
            $json,
            'Empty list should serialize as [] and empty map as {} on the same object.'
        );
    }

    public function testNonEmptyListAndEmptyMap(): void
    {
        $object = new ObjectWithListAndMap(['list' => ['a', 'b'], 'map' => []]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"list":["a","b"],"map":{}}',
            $json
        );
    }

    public function testEmptyListAndNonEmptyMap(): void
    {
        $object = new ObjectWithListAndMap(['list' => [], 'map' => ['key' => 'val']]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"list":[],"map":{"key":"val"}}',
            $json
        );
    }

    /**
     * Test 2: Union containing an empty object isolates the stdClass guard.
     * The guard at `!($value instanceof \stdClass)` prevents re-entry during union serialization.
     */
    public function testUnionWithEmptyObject(): void
    {
        $object = new ObjectWithUnionEmpty(['value' => new EmptyUnionMember([])]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"value":{}}',
            $json,
            'Union containing an empty object should serialize to {} via the stdClass guard path.'
        );
    }

    public function testUnionWithNonEmptyObject(): void
    {
        $object = new ObjectWithUnionEmpty(['value' => new EmptyUnionMember(['tag' => 'hello'])]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"value":{"tag":"hello"}}',
            $json
        );
    }

    public function testUnionWithStringFallback(): void
    {
        $object = new ObjectWithUnionEmpty(['value' => 'plain string']);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"value":"plain string"}',
            $json
        );
    }

    /**
     * Test 3: Deeply nested / collection-of-maps cases.
     */
    public function testListOfEmptyMaps(): void
    {
        $object = new ObjectWithListOfMaps(['items' => [[], []]]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"items":[{},{}]}',
            $json,
            'A list of empty maps should produce [{},{}] — each empty map is {} but the list stays [].'
        );
    }

    public function testListOfMixedMaps(): void
    {
        $object = new ObjectWithListOfMaps(['items' => [['a' => 'b'], [], ['c' => 'd']]]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"items":[{"a":"b"},{},{"c":"d"}]}',
            $json
        );
    }

    public function testMapOfEmptyObjects(): void
    {
        $object = new ObjectWithMapOfObjects([
            'entries' => [
                'first' => new EmptyUnionMember([]),
                'second' => new EmptyUnionMember([]),
            ]
        ]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"entries":{"first":{},"second":{}}}',
            $json,
            'A map whose values are empty objects should produce {"a":{},"b":{}}.'
        );
    }

    public function testMapOfMixedObjects(): void
    {
        $object = new ObjectWithMapOfObjects([
            'entries' => [
                'empty' => new EmptyUnionMember([]),
                'filled' => new EmptyUnionMember(['tag' => 'present']),
            ]
        ]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString(
            '{"entries":{"empty":{},"filled":{"tag":"present"}}}',
            $json
        );
    }

    /**
     * Test 4: additionalProperties interaction.
     * An object with only additional (unmapped) properties and all declared properties null
     * should still produce {}.
     */
    public function testEmptyObjectWithAdditionalPropertiesOnly(): void
    {
        $json = '{"extra_key":"extra_value"}';
        $object = ObjectWithAdditionalOnly::fromJson($json);
        $this->assertNull($object->name);
        $this->assertEquals(['extra_key' => 'extra_value'], $object->getAdditionalProperties());

        $reserialized = $object->toJson();
        $this->assertEquals('{}', $reserialized, 'Object with only additional properties (no declared fields set) should serialize to {}.');
    }

    public function testEmptyObjectNoAdditionalProperties(): void
    {
        $object = new ObjectWithAdditionalOnly([]);
        $json = $object->toJson();
        $this->assertEquals('{}', $json, 'Object with all null properties and no additional properties should serialize to {}.');
    }

    /**
     * Round-trip: deserialize from correct JSON and re-serialize.
     */
    public function testRoundTripListAndMap(): void
    {
        $inputJson = '{"list":[],"map":{}}';
        $object = ObjectWithListAndMap::fromJson($inputJson);
        $this->assertEmpty($object->list);
        $this->assertEmpty($object->map);
        $this->assertJsonStringEqualsJsonString($inputJson, $object->toJson());
    }

    public function testRoundTripUnionWithEmptyObject(): void
    {
        $inputJson = '{"value":{}}';
        $object = ObjectWithUnionEmpty::fromJson($inputJson);
        $this->assertInstanceOf(EmptyUnionMember::class, $object->value);
        $this->assertJsonStringEqualsJsonString($inputJson, $object->toJson());
    }
}
