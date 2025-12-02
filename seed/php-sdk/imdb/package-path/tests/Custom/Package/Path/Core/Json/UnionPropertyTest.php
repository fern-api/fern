<?php

namespace Custom\Package\Path\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Custom\Package\Path\Core\Json\JsonProperty;
use Custom\Package\Path\Core\Json\JsonSerializableType;
use Custom\Package\Path\Core\Types\Union;

class UnionProperty extends JsonSerializableType
{

    #[Union(new Union('string', 'integer'), 'null', ['integer' => 'integer'], UnionProperty::class)]
    #[JsonProperty('complexUnion')]
    public mixed $complexUnion;

    /**
     * @param array{
     *   complexUnion: string|int|null|array<int, int>|UnionProperty
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->complexUnion = $values['complexUnion'];
    }
}

class UnionPropertyTest extends TestCase
{
    public function testWithMapOfIntToInt(): void
    {
        $expectedJson = json_encode(
            [
                'complexUnion' => [1 => 100, 2 => 200]
            ],
            JSON_THROW_ON_ERROR
        );

        $object = UnionProperty::fromJson($expectedJson);
        $this->assertIsArray($object->complexUnion, 'complexUnion should be an array.');
        $this->assertEquals([1 => 100, 2 => 200], $object->complexUnion, 'complexUnion should match the original map of int => int.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithNestedUnionPropertyType(): void
    {
        $expectedJson = json_encode(
            [
                'complexUnion' => new UnionProperty(
                    [
                        'complexUnion' => 'Nested String'
                    ]
                )
                    ],
            JSON_THROW_ON_ERROR
        );

        $object = UnionProperty::fromJson($expectedJson);
        $this->assertInstanceOf(UnionProperty::class, $object->complexUnion, 'complexUnion should be an instance of UnionPropertyType.');
        $this->assertEquals('Nested String', $object->complexUnion->complexUnion, 'Nested complexUnion should match the original value.');

        $actualJson= $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithNull(): void
    {
        $expectedJson = json_encode(
            [],
            JSON_THROW_ON_ERROR
        );

        $object = UnionProperty::fromJson($expectedJson);
        $this->assertNull($object->complexUnion, 'complexUnion should be null.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithInteger(): void
    {
        $expectedJson = json_encode(
            [
                'complexUnion' => 42
            ],
            JSON_THROW_ON_ERROR
        );

        $object = UnionProperty::fromJson($expectedJson);
        $this->assertIsInt($object->complexUnion, 'complexUnion should be an integer.');
        $this->assertEquals(42, $object->complexUnion, 'complexUnion should match the original integer.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithString(): void
    {
        $expectedJson = json_encode(
            [
                'complexUnion' => 'Some String'
            ],
            JSON_THROW_ON_ERROR
        );

        $object = UnionProperty::fromJson($expectedJson);
        $this->assertIsString($object->complexUnion, 'complexUnion should be a string.');
        $this->assertEquals('Some String', $object->complexUnion, 'complexUnion should match the original string.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match the original JSON.');
    }
}