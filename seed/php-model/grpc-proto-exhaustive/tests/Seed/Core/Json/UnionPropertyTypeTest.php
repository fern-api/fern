<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\SerializableType;
use Seed\Core\Types\Union;

class UnionPropertyType extends SerializableType
{
    #[Union(new Union('string', 'integer'), 'null', ['integer' => 'integer'], UnionPropertyType::class)]
    #[JsonProperty('complexUnion')]
    public mixed $complexUnion;

    /**
     * @param array{
     *   complexUnion: string|int|null|array<int, int>|UnionPropertyType
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->complexUnion = $values['complexUnion'];
    }
}

class UnionPropertyTest extends TestCase
{
    public function testWithMapOfIntToInt(): void
    {
        $data = [
            'complexUnion' => [1 => 100, 2 => 200] // Map<int, int>
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $object = UnionPropertyType::fromJson($json);

        // Test for map<int, int>
        $this->assertIsArray($object->complexUnion, 'complexUnion should be an array.');
        $this->assertEquals([1 => 100, 2 => 200], $object->complexUnion, 'complexUnion should match the original map of int => int.');

        $serializedJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithNestedUnionPropertyType(): void
    {
        // Nested instance of UnionPropertyType
        $nestedData = [
            'complexUnion' => 'Nested String'
        ];

        $data = [
            'complexUnion' => new UnionPropertyType($nestedData) // UnionPropertyType instance
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $object = UnionPropertyType::fromJson($json);

        // Test for UnionPropertyType instance
        $this->assertInstanceOf(UnionPropertyType::class, $object->complexUnion, 'complexUnion should be an instance of UnionPropertyType.');
        $this->assertEquals('Nested String', $object->complexUnion->complexUnion, 'Nested complexUnion should match the original value.');

        $serializedJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithNull(): void
    {
        $data = [];

        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $object = UnionPropertyType::fromJson($json);

        // Test for null
        $this->assertNull($object->complexUnion, 'complexUnion should be null.');

        $serializedJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithInteger(): void
    {
        $data = [
            'complexUnion' => 42 // Integer
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $object = UnionPropertyType::fromJson($json);

        // Test for integer
        $this->assertIsInt($object->complexUnion, 'complexUnion should be an integer.');
        $this->assertEquals(42, $object->complexUnion, 'complexUnion should match the original integer.');

        $serializedJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match the original JSON.');
    }

    public function testWithString(): void
    {
        $data = [
            'complexUnion' => 'Some String' // String
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $object = UnionPropertyType::fromJson($json);

        // Test for string
        $this->assertIsString($object->complexUnion, 'complexUnion should be a string.');
        $this->assertEquals('Some String', $object->complexUnion, 'complexUnion should match the original string.');

        $serializedJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match the original JSON.');
    }
}
