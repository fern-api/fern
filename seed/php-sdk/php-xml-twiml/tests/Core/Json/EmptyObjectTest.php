<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class EmptyObject extends JsonSerializableType
{
    /**
     * @var string|null $optionalField
     */
    #[JsonProperty('optional_field')]
    public ?string $optionalField;

    /**
     * @param array{
     *   optionalField?: string|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->optionalField = $values['optionalField'] ?? null;
    }
}

class EmptyObjectWithNestedObject extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var EmptyObject $nested
     */
    #[JsonProperty('nested')]
    public EmptyObject $nested;

    /**
     * @param array{
     *   name: string,
     *   nested: EmptyObject,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->nested = $values['nested'];
    }
}

class ObjectWithEmptyMap extends JsonSerializableType
{
    /**
     * @var array<string, string> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'string'])]
    public array $metadata;

    /**
     * @param array{
     *   metadata: array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->metadata = $values['metadata'];
    }
}

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

class EmptyObjectTest extends TestCase
{
    public function testEmptyObjectSerializesToObject(): void
    {
        $object = new EmptyObject([]);
        $json = $object->toJson();
        $this->assertEquals('{}', $json, 'Empty object should serialize to {} not [].');
    }

    public function testEmptyObjectWithFieldSetSerializesCorrectly(): void
    {
        $object = new EmptyObject(['optionalField' => 'value']);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString('{"optional_field": "value"}', $json);
    }

    public function testNestedEmptyObjectSerializesToObject(): void
    {
        $parent = new EmptyObjectWithNestedObject([
            'name' => 'test',
            'nested' => new EmptyObject([]),
        ]);
        $json = $parent->toJson();
        $expected = '{"name": "test", "nested": {}}';
        $this->assertJsonStringEqualsJsonString($expected, $json, 'Nested empty object should serialize to {} not [].');
    }

    public function testDeserializeEmptyObject(): void
    {
        $json = '{}';
        $object = EmptyObject::fromJson($json);
        $this->assertNull($object->optionalField);
        $this->assertEquals('{}', $object->toJson(), 'Deserialized empty object should re-serialize to {}.');
    }

    public function testEmptyMapSerializesToObject(): void
    {
        $object = new ObjectWithEmptyMap(['metadata' => []]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString('{"metadata":{}}', $json, 'Empty map should serialize to {} not [].');
    }

    public function testNonEmptyMapSerializesCorrectly(): void
    {
        $object = new ObjectWithEmptyMap(['metadata' => ['key' => 'value']]);
        $json = $object->toJson();
        $this->assertJsonStringEqualsJsonString('{"metadata":{"key":"value"}}', $json);
    }

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
