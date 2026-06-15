<?php

namespace Custom\Package\Path\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Custom\Package\Path\Core\Json\JsonProperty;
use Custom\Package\Path\Core\Json\JsonSerializableType;

class EmptyObjectChild extends JsonSerializableType
{
    /**
     * @param array{} $values
     */
    public function __construct(
        array $values = [],
    ) {
    }
}

class EmptyObjectParent extends JsonSerializableType
{
    /**
     * @var EmptyObjectChild $child
     */
    #[JsonProperty('child')]
    public EmptyObjectChild $child;

    /**
     * @param array{
     *   child: EmptyObjectChild,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->child = $values['child'];
    }
}

class EmptyObjectTest extends TestCase
{
    public function testEmptyChildSerializesAsObject(): void
    {
        $child = new EmptyObjectChild();
        $json = $child->toJson();
        $this->assertJsonStringEqualsJsonString('{}', $json, 'Empty child should serialize to {}.');
    }

    public function testNestedEmptyChildSerializesAsObject(): void
    {
        $parent = new EmptyObjectParent(['child' => new EmptyObjectChild()]);
        $json = $parent->toJson();
        $expected = '{"child":{}}';
        $this->assertJsonStringEqualsJsonString($expected, $json, 'Nested empty child should serialize to {"child":{}}.');
    }

    public function testRoundTrip(): void
    {
        $parent = new EmptyObjectParent(['child' => new EmptyObjectChild()]);
        $json = $parent->toJson();
        $deserialized = EmptyObjectParent::fromJson($json);
        $this->assertInstanceOf(EmptyObjectChild::class, $deserialized->child);
        $this->assertJsonStringEqualsJsonString($json, $deserialized->toJson(), 'Round-trip serialization should be stable.');
    }

    public function testNonEmptyObjectUnaffected(): void
    {
        $parent = new EmptyObjectParent(['child' => new EmptyObjectChild()]);
        $parentJson = $parent->toJson();
        $this->assertJsonStringEqualsJsonString('{"child":{}}', $parentJson, 'Non-empty parent should still serialize correctly.');
    }
}
