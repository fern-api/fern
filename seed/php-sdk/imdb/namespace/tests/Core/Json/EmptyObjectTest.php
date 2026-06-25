<?php

namespace Fern\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Fern\Core\Json\JsonProperty;
use Fern\Core\Json\JsonSerializableType;

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
}
